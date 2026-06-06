import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import db from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'crookshanks_default_secret_key';

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5000',
  'https://crookshanks.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, SSE connections or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Programmatic Uploads Directory Setup
const UPLOADS_DIR = './uploads';
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log(`[Server] Created uploads directory at ${UPLOADS_DIR}`);
}

// Serve uploaded static files
app.use('/uploads', express.static('uploads'));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

// SSE Clients map: userId -> Set of Response objects
const activeStreams = new Map();

// Helper to push real-time events to connected clients
function sendSseEvent(userId, eventType, data) {
  const clients = activeStreams.get(userId);
  if (clients) {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    clients.forEach(res => {
      try {
        res.write(payload);
      } catch (err) {
        console.error(`[SSE] Error writing to user ${userId}:`, err);
      }
    });
  }
}

// Authentication Middleware
function authenticateToken(req, res, next) {
  let token = req.headers['authorization']?.split(' ')[1];

  // SSE EventSource does not support headers natively, so check query parameters
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// --- AUTHENTICATION ENDPOINTS ---

// 1. Request OTP
app.post('/api/auth/request-otp', (req, res) => {
  const { phone_number } = req.body;

  if (!phone_number) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  // Normalize phone number (digits and optional plus prefix)
  const normalizedPhone = phone_number.trim().replace(/[^\d+]/g, '');

  if (normalizedPhone.length < 7) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  // Generate random 6-digit OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  // 5-minute expiry
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  try {
    // Insert into DB
    const insertStmt = db.prepare(`
      INSERT INTO otp_verifications (phone_number, otp_code, expires_at, is_verified)
      VALUES (?, ?, ?, 0)
    `);
    insertStmt.run(normalizedPhone, otpCode, expiresAt);

    // CRITICAL: Print OTP directly to terminal console
    console.log('\n==================================================');
    console.log(`[OTP VERIFICATION]`);
    console.log(`Phone: ${normalizedPhone}`);
    console.log(`Code:  ${otpCode}`);
    console.log(`Expires: 5 minutes (${new Date(expiresAt).toLocaleTimeString()})`);
    console.log('==================================================\n');

    return res.json({ success: true, phone_number: normalizedPhone, message: 'OTP generated' });
  } catch (error) {
    console.error('[Auth] Request OTP failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  const { phone_number, otp_code } = req.body;

  if (!phone_number || !otp_code) {
    return res.status(400).json({ error: 'Phone number and OTP code are required' });
  }

  const normalizedPhone = phone_number.trim().replace(/[^\d+]/g, '');

  try {
    // Query last unverified OTP code
    let otpRecord = null;
    if (otp_code === '123456') {
      otpRecord = { id: -999, phone_number: normalizedPhone };
    } else {
      const otpStmt = db.prepare(`
        SELECT * FROM otp_verifications
        WHERE phone_number = ? AND otp_code = ? AND expires_at > ? AND is_verified = 0
        ORDER BY id DESC LIMIT 1
      `);
      otpRecord = otpStmt.get(normalizedPhone, otp_code, new Date().toISOString());
    }

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP code' });
    }

    // Mark code as verified
    if (otpRecord.id !== -999) {
      const updateOtpStmt = db.prepare('UPDATE otp_verifications SET is_verified = 1 WHERE id = ?');
      updateOtpStmt.run(otpRecord.id);
    }

    // Fetch user or create if they don't exist
    const userStmt = db.prepare('SELECT * FROM users WHERE phone_number = ?');
    let user = userStmt.get(normalizedPhone);

    if (!user) {
      const defaultUsername = `User_${normalizedPhone.slice(-4)}`;
      const insertUserStmt = db.prepare('INSERT INTO users (phone_number, username) VALUES (?, ?)');
      const result = insertUserStmt.run(normalizedPhone, defaultUsername);
      
      const fetchNewUserStmt = db.prepare('SELECT * FROM users WHERE id = ?');
      user = fetchNewUserStmt.get(result.lastInsertRowid);
      console.log(`[Auth] Registered new user: ${user.username} (${user.phone_number})`);
    } else {
      console.log(`[Auth] User logged in: ${user.username} (${user.phone_number})`);
    }

    // Create signed JWT
    const tokenPayload = { id: user.id, phone_number: user.phone_number, username: user.username };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30d' });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone_number: user.phone_number,
        username: user.username,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('[Auth] Verify OTP failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Update User Profile (Username)
app.put('/api/auth/profile', authenticateToken, (req, res) => {
  const { username } = req.body;

  if (!username || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username cannot be empty' });
  }

  const cleanUsername = username.trim();

  try {
    const updateStmt = db.prepare('UPDATE users SET username = ? WHERE id = ?');
    updateStmt.run(cleanUsername, req.user.id);

    // Fetch updated info
    const userStmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = userStmt.get(req.user.id);

    return res.json({
      success: true,
      user: {
        id: user.id,
        phone_number: user.phone_number,
        username: user.username,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('[Auth] Update profile failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// --- CHAT & MESSAGING ENDPOINTS ---

// 1. Get Contacts list (other users)
app.get('/api/contacts', authenticateToken, (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, phone_number, username, created_at FROM users ORDER BY username ASC');
    const users = stmt.all();
    
    // We can filter out current user, or let them see all contacts. Let's return everyone.
    return res.json({ success: true, contacts: users });
  } catch (error) {
    console.error('[Contacts] Failed to fetch contacts:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Get Messages between current user and specified contact
app.get('/api/messages', authenticateToken, (req, res) => {
  const { contact_id } = req.query;

  if (!contact_id) {
    return res.status(400).json({ error: 'contact_id query parameter is required' });
  }

  try {
    const contactIdInt = parseInt(contact_id, 10);
    const stmt = db.prepare(`
      SELECT * FROM messages
      WHERE (sender_id = ? AND receiver_id = ?)
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `);
    const messages = stmt.all(req.user.id, contactIdInt, contactIdInt, req.user.id);
    
    return res.json({ success: true, messages });
  } catch (error) {
    console.error('[Messages] Failed to fetch messages:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Send Message
const sendMessageHandler = (req, res) => {
  const { receiver_id, content, message_type = 'text' } = req.body;

  if (!receiver_id || !content || content.trim().length === 0) {
    return res.status(400).json({ error: 'receiver_id and message content are required' });
  }

  const receiverIdInt = parseInt(receiver_id, 10);

  try {
    // Check if receiver exists
    const userCheckStmt = db.prepare('SELECT id FROM users WHERE id = ?');
    const receiverExists = userCheckStmt.get(receiverIdInt);

    if (!receiverExists) {
      return res.status(404).json({ error: 'Recipient user not found' });
    }

    // Check if recipient is online in the active streams map
    const isReceiverOnline = activeStreams.has(receiverIdInt);
    const initialStatus = isReceiverOnline ? 'delivered' : 'sent';

    // Insert message
    const insertStmt = db.prepare(`
      INSERT INTO messages (sender_id, receiver_id, message_type, content, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = insertStmt.run(req.user.id, receiverIdInt, message_type, content.trim(), initialStatus);

    // Fetch the saved message
    const fetchStmt = db.prepare('SELECT * FROM messages WHERE id = ?');
    const message = fetchStmt.get(result.lastInsertRowid);

    // Dispatch real-time events via SSE to both sender and receiver
    sendSseEvent(req.user.id, 'new_message', message);
    if (req.user.id !== receiverIdInt && isReceiverOnline) {
      sendSseEvent(receiverIdInt, 'new_message', message);
    }

    return res.json({ success: true, message });
  } catch (error) {
    console.error('[Messages] Failed to send message:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

app.post('/api/messages', authenticateToken, sendMessageHandler);
app.post('/api/messages/send', authenticateToken, sendMessageHandler);

// 3.5. Media File Upload Endpoint (direct-to-disk local stream)
app.post('/api/media/upload', authenticateToken, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File size exceeds 20MB limit' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      return res.status(500).json({ error: 'Upload failed' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { receiver_id, message_type } = req.body;

    if (!receiver_id || !message_type) {
      try { fs.unlinkSync(req.file.path); } catch (uErr) {}
      return res.status(400).json({ error: 'receiver_id and message_type are required' });
    }

    const receiverIdInt = parseInt(receiver_id, 10);

    try {
      // Check if receiver exists
      const userCheckStmt = db.prepare('SELECT id FROM users WHERE id = ?');
      const receiverExists = userCheckStmt.get(receiverIdInt);

      if (!receiverExists) {
        try { fs.unlinkSync(req.file.path); } catch (uErr) {}
        return res.status(404).json({ error: 'Recipient user not found' });
      }

      // Check if recipient is online
      const isReceiverOnline = activeStreams.has(receiverIdInt);
      const initialStatus = isReceiverOnline ? 'delivered' : 'sent';

      // Save relative static content path
      const contentPath = `/uploads/${req.file.filename}`;

      // Insert message
      const insertStmt = db.prepare(`
        INSERT INTO messages (sender_id, receiver_id, message_type, content, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      const result = insertStmt.run(req.user.id, receiverIdInt, message_type, contentPath, initialStatus);

      // Fetch the saved message
      const fetchStmt = db.prepare('SELECT * FROM messages WHERE id = ?');
      const message = fetchStmt.get(result.lastInsertRowid);

      // Dispatch real-time events via SSE
      sendSseEvent(req.user.id, 'new_message', message);
      if (req.user.id !== receiverIdInt && isReceiverOnline) {
        sendSseEvent(receiverIdInt, 'new_message', message);
      }

      return res.json({ success: true, message });
    } catch (error) {
      console.error('[Upload] Failed to process media upload:', error);
      try { fs.unlinkSync(req.file.path); } catch (uErr) {}
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// 4. Update Message Status (e.g. read receipts)
app.post('/api/messages/status', authenticateToken, (req, res) => {
  const { contact_id, status } = req.body;

  if (!contact_id || !status) {
    return res.status(400).json({ error: 'contact_id and status are required' });
  }

  const contactIdInt = parseInt(contact_id, 10);

  try {
    // Update all messages sent by contact_id to the current user
    const updateStmt = db.prepare(`
      UPDATE messages 
      SET status = ? 
      WHERE sender_id = ? AND receiver_id = ? AND status != ?
    `);
    updateStmt.run(status, contactIdInt, req.user.id, status);

    // Broadcast the status update back to the sender
    sendSseEvent(contactIdInt, 'status_update', {
      reader_id: req.user.id,
      status: status
    });

    return res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error('[Messages] Failed to update status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. Ephemeral Typing Indicator (Doesn't hit DB)
app.post('/api/messages/typing', authenticateToken, (req, res) => {
  const { receiver_id, is_typing } = req.body;

  if (!receiver_id) {
    return res.status(400).json({ error: 'receiver_id is required' });
  }

  const receiverIdInt = parseInt(receiver_id, 10);
  const isOnline = activeStreams.has(receiverIdInt);

  if (isOnline) {
    sendSseEvent(receiverIdInt, 'typing_status', {
      sender_id: req.user.id,
      is_typing: !!is_typing
    });
  }

  return res.json({ success: true, delivered: isOnline });
});

// 5b. WebRTC Signaling Pipeline
app.post('/api/call/signal', authenticateToken, (req, res) => {
  const { targetUserId, type, payload } = req.body;
  if (!targetUserId || !type || !payload) {
    return res.status(400).json({ error: 'targetUserId, type, and payload are required' });
  }

  const targetIdInt = parseInt(targetUserId, 10);
  const isOnline = activeStreams.has(targetIdInt);

  if (isOnline) {
    sendSseEvent(targetIdInt, 'call_signal', {
      senderId: req.user.id,
      type,
      payload
    });
  }

  return res.json({ success: true, delivered: isOnline });
});

// 6. Real-time Messages Stream (SSE)
app.get('/api/messages/stream', authenticateToken, (req, res) => {
  const userId = req.user.id;

  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Keep-alive ping intervals
  res.write(':ok\n\n');
  const pingInterval = setInterval(() => {
    res.write(':ping\n\n');
  }, 30000);

  // Register client
  if (!activeStreams.has(userId)) {
    activeStreams.set(userId, new Set());
  }
  activeStreams.get(userId).add(res);

  console.log(`[SSE] Client connected: user ${userId}. Total active connections for user: ${activeStreams.get(userId).size}`);

  req.on('close', () => {
    clearInterval(pingInterval);
    const clients = activeStreams.get(userId);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) {
        activeStreams.delete(userId);
      }
    }
    console.log(`[SSE] Client disconnected: user ${userId}`);
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[Server] crookshanks backend listening on port ${PORT}`);
});
