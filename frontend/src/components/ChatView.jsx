import React, { useState, useEffect, useRef } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import useChatStream from '../hooks/useChatStream';

function ImageBubble({ src, alt, isSelf, status, created_at, formatTime }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative rounded-lg overflow-hidden group min-w-[200px] min-h-[150px] bg-gray-200/50 dark:bg-zinc-800/40 flex items-center justify-center">
      {!loaded && (
        <div 
          className="absolute inset-0 bg-gray-200/80 dark:bg-zinc-800/60 filter blur-md animate-pulse" 
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.15) 100%)' }}
        />
      )}
      <img 
        src={src} 
        alt={alt || "Media"} 
        onLoad={() => setLoaded(true)}
        className={`w-full h-auto object-cover max-h-72 min-h-36 min-w-[200px] transition-all duration-500 ease-in-out ${
          loaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-95'
        }`}
        loading="lazy"
      />
      
      <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-black/45 text-white rounded-full flex items-center space-x-1 text-[9px] font-semibold backdrop-blur-[2px] shadow-sm select-none z-10 border border-white/5">
        <span>{formatTime(created_at)}</span>
        {isSelf && (
          <span className="self-center">
            {status === 'sent' && (
              <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === 'delivered' && (
              <svg className="w-4.5 h-4.5 text-gray-300" viewBox="0 0 16 16" fill="currentColor">
                <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.496-.496L3.483 11l.5.5a.5.5 0 0 0 .708 0l3.5-3.5a.5.5 0 0 0 0-.708z"/>
                <path d="M6.253 11.377 12.354 5.276a.5.5 0 0 1 .708.708l-6.5 6.5a.5.5 0 0 1-.708 0L3.376 9.5a.5.5 0 0 1 .708-.708l2.169 2.169z"/>
              </svg>
            )}
            {status === 'read' && (
              <svg className="w-4.5 h-4.5 text-sky-400" viewBox="0 0 16 16" fill="currentColor">
                <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.496-.496L3.483 11l.5.5a.5.5 0 0 0 .708 0l3.5-3.5a.5.5 0 0 0 0-.708z"/>
                <path d="M6.253 11.377 12.354 5.276a.5.5 0 0 1 .708.708l-6.5 6.5a.5.5 0 0 1-.708 0L3.376 9.5a.5.5 0 0 1 .708-.708l2.169 2.169z"/>
              </svg>
            )}
          </span>
        )}
      </div>
    </div>
  );
}

function VideoBubble({ src, isSelf, status, created_at, formatTime }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState('');

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(err => console.error("Video play error:", err));
      setIsPlaying(true);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const durationSecs = videoRef.current.duration;
      if (isNaN(durationSecs)) return;
      const mins = Math.floor(durationSecs / 60);
      const secs = Math.floor(durationSecs % 60);
      setDuration(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
    }
  };

  return (
    <div className="relative min-w-[240px] max-h-72 min-h-[150px] bg-black rounded-lg overflow-hidden flex items-center justify-center group">
      <video 
        ref={videoRef}
        src={src}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
        className="w-full max-h-72 object-contain cursor-pointer"
        playsInline
        controls={isPlaying}
      />

      {!isPlaying && (
        <button 
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/60 hover:bg-black/75 flex items-center justify-center text-white transition-all shadow-md active:scale-95 focus:outline-none z-10 border border-white/10"
        >
          <svg className="w-5.5 h-5.5 text-white ml-[3px]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}

      {duration && !isPlaying && (
        <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/45 text-white rounded-full text-[9px] font-semibold backdrop-blur-[2px] select-none z-10 border border-white/5">
          <span>{duration}</span>
        </div>
      )}

      <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-black/45 text-white rounded-full flex items-center space-x-1 text-[9px] font-semibold backdrop-blur-[2px] shadow-sm select-none z-10 border border-white/5">
        <span>{formatTime(created_at)}</span>
        {isSelf && (
          <span className="self-center">
            {status === 'sent' && (
              <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === 'delivered' && (
              <svg className="w-4.5 h-4.5 text-gray-300" viewBox="0 0 16 16" fill="currentColor">
                <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.496-.496L3.483 11l.5.5a.5.5 0 0 0 .708 0l3.5-3.5a.5.5 0 0 0 0-.708z"/>
                <path d="M6.253 11.377 12.354 5.276a.5.5 0 0 1 .708.708l-6.5 6.5a.5.5 0 0 1-.708 0L3.376 9.5a.5.5 0 0 1 .708-.708l2.169 2.169z"/>
              </svg>
            )}
            {status === 'read' && (
              <svg className="w-4.5 h-4.5 text-sky-400" viewBox="0 0 16 16" fill="currentColor">
                <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.496-.496L3.483 11l.5.5a.5.5 0 0 0 .708 0l3.5-3.5a.5.5 0 0 0 0-.708z"/>
                <path d="M6.253 11.377 12.354 5.276a.5.5 0 0 1 .708.708l-6.5 6.5a.5.5 0 0 1-.708 0L3.376 9.5a.5.5 0 0 1 .708-.708l2.169 2.169z"/>
              </svg>
            )}
          </span>
        )}
      </div>
    </div>
  );
}

function DocumentBubble({ src, filename, isSelf, status, created_at, formatTime }) {
  const fileUrl = src.startsWith('blob:') ? src : `${API_URL}${src}`;
  
  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      onClick={handleDownload}
      className="p-3 min-w-[240px] max-w-[280px] bg-gray-50 dark:bg-zinc-900/60 rounded-lg flex items-center space-x-3 cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-zinc-800/80 transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
        <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0 pr-2 text-left">
        <p className="text-xs font-semibold text-gray-800 dark:text-zinc-200 truncate">
          {filename || 'Document'}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">
          Open Document
        </p>
      </div>
      
      <div className="text-gray-400 dark:text-zinc-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </div>
    </div>
  );
}

export default function ChatView() {
  const { user, token, logout, updateProfile } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('chats'); // chats, settings
  const [chatFilter, setChatFilter] = useState('all'); // all, unread
  
  // Profile settings state
  const [usernameInput, setUsernameInput] = useState(user?.username || '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Unread messages counts per contact: contactId -> count
  const [unreads, setUnreads] = useState({});
  // Last message per contact: contactId -> message object
  const [lastMessages, setLastMessages] = useState({});
  // Typing users mapping: contactId -> boolean
  const [typingUsers, setTypingUsers] = useState({});

  // Phase 3 Attachment sheet & input refs
  const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);
  const fileInputRef = useRef(null);

  const messagesEndRef = useRef(null);
  
  // Typing status refs for throttling and debouncing
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef(null);
  const lastTypingSentRef = useRef(0);

  // Phase 4 WebRTC Calling State
  const [callState, setCallState] = useState('idle'); // idle, ringing_out, ringing_in, connected, ended
  const [callType, setCallType] = useState('voice'); // voice, video
  const [callPartner, setCallPartner] = useState(null); // User object of caller/receiver
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  
  // Call configuration state toggles
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // References for WebRTC pipeline
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);
  const callDurationIntervalRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Bind local/remote streams to video tags when they update
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callState]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callState]);

  // Track call duration when connected
  useEffect(() => {
    if (callState === 'connected') {
      setCallDuration(0);
      callDurationIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else if (callState === 'idle') {
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current);
        callDurationIntervalRef.current = null;
      }
    }
    return () => {
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current);
      }
    };
  }, [callState]);

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const sendSignal = async (targetUserId, type, payload) => {
    try {
      await fetch(`${API_URL}/api/call/signal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId, type, payload })
      });
    } catch (err) {
      console.error('[WebRTC] Failed to send signal:', err);
    }
  };

  const handleStartCall = async (type) => {
    if (!selectedContact) return;
    setCallType(type);
    setCallPartner(selectedContact);
    setCallState('ringing_out');
    pendingIceCandidatesRef.current = [];

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: type === 'video',
          audio: true
        });
      } catch (mediaErr) {
        console.warn('[WebRTC] Camera/Mic not available, falling back to animated mock stream:', mediaErr);
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        let theta = 0;
        const intervalId = setInterval(() => {
          ctx.fillStyle = '#0b141a';
          ctx.fillRect(0, 0, 640, 480);
          ctx.fillStyle = '#075e54';
          ctx.beginPath();
          ctx.arc(320 + Math.sin(theta) * 150, 240 + Math.cos(theta) * 50, 40, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 24px sans-serif';
          ctx.fillText('crookshanks Live Feed', 40, 60);
          ctx.font = '16px sans-serif';
          ctx.fillStyle = '#a0aec0';
          ctx.fillText(new Date().toLocaleTimeString(), 40, 90);
          theta += 0.05;
        }, 50);
        
        stream = canvas.captureStream(30);
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const dest = audioCtx.createMediaStreamDestination();
          osc.connect(dest);
          osc.start();
          const audioTrack = dest.stream.getAudioTracks()[0];
          if (audioTrack) {
            stream.addTrack(audioTrack);
          }
          stream.cleanupMock = () => {
            clearInterval(intervalId);
            osc.stop();
            audioCtx.close();
          };
        } catch (audioErr) {
          console.error('[WebRTC] Mock audio creation failed:', audioErr);
        }
      }

      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal(selectedContact.id, 'ice-candidate', event.candidate);
        }
      };

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          remoteStreamRef.current = event.streams[0];
          setRemoteStream(event.streams[0]);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await sendSignal(selectedContact.id, 'offer', {
        sdp: pc.localDescription,
        callType: type
      });
    } catch (err) {
      console.error('[WebRTC] Error starting call:', err);
      handleEndCall(true);
    }
  };

  const handleAcceptCall = async () => {
    if (!callPartner) return;
    setCallState('connected');
    pendingIceCandidatesRef.current = [];

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: callType === 'video',
          audio: true
        });
      } catch (mediaErr) {
        console.warn('[WebRTC] Camera/Mic not available, falling back to animated mock stream:', mediaErr);
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        let theta = 0;
        const intervalId = setInterval(() => {
          ctx.fillStyle = '#0b141a';
          ctx.fillRect(0, 0, 640, 480);
          ctx.fillStyle = '#075e54';
          ctx.beginPath();
          ctx.arc(320 + Math.sin(theta) * 150, 240 + Math.cos(theta) * 50, 40, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 24px sans-serif';
          ctx.fillText('crookshanks Live Feed', 40, 60);
          ctx.font = '16px sans-serif';
          ctx.fillStyle = '#a0aec0';
          ctx.fillText(new Date().toLocaleTimeString(), 40, 90);
          theta += 0.05;
        }, 50);
        
        stream = canvas.captureStream(30);
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const dest = audioCtx.createMediaStreamDestination();
          osc.connect(dest);
          osc.start();
          const audioTrack = dest.stream.getAudioTracks()[0];
          if (audioTrack) {
            stream.addTrack(audioTrack);
          }
          stream.cleanupMock = () => {
            clearInterval(intervalId);
            osc.stop();
            audioCtx.close();
          };
        } catch (audioErr) {
          console.error('[WebRTC] Mock audio creation failed:', audioErr);
        }
      }

      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal(callPartner.id, 'ice-candidate', event.candidate);
        }
      };

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          remoteStreamRef.current = event.streams[0];
          setRemoteStream(event.streams[0]);
        }
      };

      const offerSdp = peerConnectionRef.currentOffer;
      if (offerSdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
      }

      while (pendingIceCandidatesRef.current.length > 0) {
        const cand = pendingIceCandidatesRef.current.shift();
        await pc.addIceCandidate(new RTCIceCandidate(cand));
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await sendSignal(callPartner.id, 'answer', {
        sdp: pc.localDescription
      });
    } catch (err) {
      console.error('[WebRTC] Error accepting call:', err);
      handleEndCall(true);
    }
  };

  const handleEndCall = (sendHangupSignal = true) => {
    if (sendHangupSignal && callPartner) {
      sendSignal(callPartner.id, 'hangup', {});
    }

    if (callDurationIntervalRef.current) {
      clearInterval(callDurationIntervalRef.current);
      callDurationIntervalRef.current = null;
    }
    setCallDuration(0);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      if (localStreamRef.current.cleanupMock) {
        localStreamRef.current.cleanupMock();
      }
      localStreamRef.current = null;
    }
    setLocalStream(null);

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setRemoteStream(null);
    setCallState('idle');
    setCallPartner(null);
    setIsMuted(false);
    setIsSpeakerOn(false);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Fetch initial contacts and cache state
  useEffect(() => {
    fetchContacts();
  }, []);

  // Fetch message history and mark as read when selected contact changes
  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);
      markMessagesAsRead(selectedContact.id);
      // Clear unread count for this contact
      setUnreads(prev => ({ ...prev, [selectedContact.id]: 0 }));
      // Clear typing status on switch just in case
      setTypingUsers(prev => ({ ...prev, [selectedContact.id]: false }));
    }
  }, [selectedContact]);

  // Connect to SSE real-time stream via custom hook
  const streamConnected = useChatStream(token, {
    onNewMessage: (msg) => {
      // Update last message preview
      const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      setLastMessages((prev) => ({ ...prev, [partnerId]: msg }));

      // Append to message list if from/to the currently open contact
      if (
        selectedContact &&
        ((msg.sender_id === selectedContact.id && msg.receiver_id === user.id) ||
          (msg.sender_id === user.id && msg.receiver_id === selectedContact.id))
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;

          // SSE Deduplication & Temp Message Replacement for Sender
          if (msg.sender_id === user.id && (msg.message_type === 'image' || msg.message_type === 'video' || msg.message_type === 'audio' || msg.message_type === 'document')) {
            const tempIndex = prev.findIndex(m => m.isTemp && m.message_type === msg.message_type && !m.isError);
            if (tempIndex !== -1) {
              const updated = [...prev];
              updated[tempIndex] = msg;
              return updated;
            }
          }
          return [...prev, msg];
        });

        // If active contact is the sender, mark as read immediately
        if (msg.sender_id === selectedContact.id) {
          markMessagesAsRead(selectedContact.id);
        }
      } else if (msg.sender_id !== user.id) {
        // Increment unread count for other chats
        setUnreads((prev) => ({
          ...prev,
          [msg.sender_id]: (prev[msg.sender_id] || 0) + 1,
        }));
      }
    },
    onStatusUpdate: (data) => {
      // If the active contact read our messages, update state to 'read'
      if (selectedContact && data.reader_id === selectedContact.id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender_id === user.id ? { ...m, status: data.status } : m
          )
        );
      }
      // Also update last message status
      setLastMessages((prev) => {
        const lastMsg = prev[data.reader_id];
        if (lastMsg && lastMsg.sender_id === user.id) {
          return { ...prev, [data.reader_id]: { ...lastMsg, status: data.status } };
        }
        return prev;
      });
    },
    onTypingStatus: (data) => {
      setTypingUsers((prev) => ({
        ...prev,
        [data.sender_id]: data.is_typing,
      }));
    },
    onCallSignal: async (data) => {
      const { senderId, type, payload } = data;
      console.log(`[WebRTC] Received call signal: type=${type} from sender=${senderId}`);

      if (type === 'offer') {
        let partnerUser = contacts.find(c => c.id === senderId);
        if (!partnerUser) {
          partnerUser = { id: senderId, username: `User_${senderId}` };
        }
        setCallPartner(partnerUser);
        setCallType(payload.callType || 'voice');
        setCallState('ringing_in');
        peerConnectionRef.currentOffer = payload.sdp;
      } else if (type === 'answer') {
        if (peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            setCallState('connected');
            while (pendingIceCandidatesRef.current.length > 0) {
              const cand = pendingIceCandidatesRef.current.shift();
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(cand));
            }
          } catch (err) {
            console.error('[WebRTC] Error setting remote description (answer):', err);
          }
        }
      } else if (type === 'ice-candidate') {
        const candidate = payload;
        if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.error('[WebRTC] Error adding ICE candidate:', err);
          }
        } else {
          pendingIceCandidatesRef.current.push(candidate);
        }
      } else if (type === 'hangup') {
        handleEndCall(false);
      }
    },
  });

  // Auto-scroll messages list to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        const list = data.contacts.filter(c => c.id !== user.id);
        setContacts(list);

        // Prepopulate last messages
        list.forEach(contact => {
          fetchLastMessage(contact.id);
        });
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    }
  };

  const fetchLastMessage = async (contactId) => {
    try {
      const response = await fetch(`${API_URL}/api/messages?contact_id=${contactId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.messages.length > 0) {
        const lastMsg = data.messages[data.messages.length - 1];
        setLastMessages(prev => ({ ...prev, [contactId]: lastMsg }));
      }
    } catch (err) {
      console.error(`Failed to fetch last message for ${contactId}:`, err);
    }
  };

  const fetchMessages = async (contactId) => {
    try {
      const response = await fetch(`${API_URL}/api/messages?contact_id=${contactId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const markMessagesAsRead = async (contactId) => {
    try {
      await fetch(`${API_URL}/api/messages/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contact_id: contactId, status: 'read' })
      });
    } catch (err) {
      console.error('Failed to update read status:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedContact) return;

    // Reset typing status immediately upon sending
    if (isTypingRef.current) {
      isTypingRef.current = false;
      sendTypingStatus(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }

    const body = {
      receiver_id: selectedContact.id,
      content: inputText.trim()
    };

    setInputText('');

    try {
      const response = await fetch(`${API_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) {
        console.error('Failed to send message:', data.error);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const triggerFileSelect = (acceptType) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptType;
      fileInputRef.current.click();
    }
  };

  // Phase 3: Media File Upload handler with Object URL previews
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedContact) return;

    // Reset standard input value to allow selecting identical file again
    e.target.value = '';

    // Determine target media message type
    let messageType = 'image';
    if (file.type.startsWith('video/')) {
      messageType = 'video';
    } else if (file.type.startsWith('audio/')) {
      messageType = 'audio';
    } else if (!file.type.startsWith('image/')) {
      messageType = 'document';
    }

    // 1. Generate local blob URL for instant timeline preview
    const localPreviewUrl = URL.createObjectURL(file);
    const tempId = 'temp-' + Date.now();

    const tempMsg = {
      id: tempId,
      sender_id: user.id,
      receiver_id: selectedContact.id,
      message_type: messageType,
      content: localPreviewUrl,
      filename: file.name,
      status: 'sent',
      isTemp: true,
      created_at: new Date().toISOString()
    };

    // Render preview instantly
    setMessages(prev => [...prev, tempMsg]);

    // 2. Perform multipart form POST in background
    const formData = new FormData();
    formData.append('file', file);
    formData.append('receiver_id', selectedContact.id);
    formData.append('message_type', messageType);

    try {
      const response = await fetch(`${API_URL}/api/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('[Upload] Media upload failed:', data.error);
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, isError: true } : m));
      } else {
        // Safe replacement check for race conditions
        setMessages(prev => {
          if (prev.some(m => m.id === data.message.id)) {
            return prev.filter(m => m.id !== tempId);
          }
          return prev.map(m => m.id === tempId ? data.message : m);
        });
      }
    } catch (err) {
      console.error('[Upload] Media upload network error:', err);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, isError: true } : m));
    }
  };

  const sendTypingStatus = async (isTyping) => {
    if (!selectedContact) return;
    try {
      await fetch(`${API_URL}/api/messages/typing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiver_id: selectedContact.id, is_typing: isTyping })
      });
    } catch (err) {
      console.error('Failed to send typing status:', err);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputText(value);

    if (!selectedContact) return;

    const now = Date.now();
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTypingStatus(true);
      lastTypingSentRef.current = now;
    } else if (now - lastTypingSentRef.current > 3000) {
      // Throttle typing updates every 3s
      sendTypingStatus(true);
      lastTypingSentRef.current = now;
    }

    // Debounce the typing stopped state (trigger after 2s of no input)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      sendTypingStatus(false);
    }, 2000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    try {
      await updateProfile(usernameInput);
      setProfileSuccess(true);
    } catch (err) {
      setProfileError(err.message || 'Failed to update username');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.slice(0, 2).toUpperCase();
  };

  const formatTime = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const getAvatarColor = (id) => {
    const colors = [
      'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 
      'bg-indigo-400', 'bg-purple-400', 'bg-pink-400', 'bg-teal-400'
    ];
    return colors[id % colors.length];
  };

  const filteredContacts = contacts.filter(c => {
    const nameMatch = (c.username || '').toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = (c.phone_number || '').includes(searchQuery);
    
    if (chatFilter === 'unread') {
      return (nameMatch || phoneMatch) && (unreads[c.id] > 0);
    }
    return nameMatch || phoneMatch;
  });

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-gray-50 dark:bg-zinc-950 overflow-hidden relative">
      {/* Hidden file input for Phase 3 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* LEFT PANE: CONTACTS / SETTINGS */}
      <div 
        className={`w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 ${
          selectedContact ? 'hidden md:flex' : 'flex'
        } h-full`}
      >
        {activeTab === 'chats' ? (
          <>
            {/* Chats Pane Header */}
            <div className="p-4 pb-2 flex justify-between items-center safe-pt">
              <button 
                onClick={() => setActiveTab('settings')}
                className="text-ios-blue text-sm font-medium hover:opacity-80 flex items-center space-x-1"
              >
                <div className={`w-7 h-7 rounded-full ${getAvatarColor(user.id)} text-white font-bold flex items-center justify-center text-xs shadow-inner`}>
                  {getInitials(user.username)}
                </div>
              </button>
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${streamConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} title={streamConnected ? 'Connected' : 'Offline'}></span>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h1>
              </div>
              <button className="text-ios-blue hover:opacity-80">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="px-4 py-2 flex space-x-2 border-b border-gray-100 dark:border-zinc-800/60">
              <button 
                onClick={() => setChatFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  chatFilter === 'all' 
                    ? 'bg-ios-blue text-white' 
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setChatFilter('unread')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center space-x-1 ${
                  chatFilter === 'unread' 
                    ? 'bg-ios-blue text-white' 
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'
                }`}
              >
                <span>Unread</span>
                {Object.values(unreads).some(v => v > 0) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                )}
              </button>
            </div>

            {/* Search bar */}
            <div className="px-4 py-2">
              <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-lg px-3 py-1.5">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-transparent outline-none w-full text-sm placeholder-gray-400 text-gray-900 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Chat List Scroll Container */}
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.length === 0 ? (
                <div className="text-gray-400 dark:text-zinc-500 text-sm text-center pt-8 px-4">
                  {searchQuery ? 'No chats found matching search' : 'No contacts available yet.'}
                </div>
              ) : (
                filteredContacts.map(contact => {
                  const isSelected = selectedContact?.id === contact.id;
                  const unreadCount = unreads[contact.id] || 0;
                  const lastMsg = lastMessages[contact.id];
                  const isUserTyping = typingUsers[contact.id];
                  
                  return (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`flex items-center px-4 py-3 border-b border-gray-100 dark:border-zinc-800/40 cursor-pointer select-none transition-colors ${
                        isSelected 
                          ? 'bg-blue-50 dark:bg-zinc-800/60' 
                          : 'hover:bg-gray-50 dark:hover:bg-zinc-800/20'
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm ${getAvatarColor(contact.id)}`}>
                        {getInitials(contact.username)}
                      </div>

                      {/* Content Preview */}
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {contact.username}
                          </h2>
                          <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">
                            {lastMsg ? formatTime(lastMsg.created_at) : ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          {isUserTyping ? (
                            <p className="text-xs text-wa-green font-semibold animate-pulse truncate">
                              typing...
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500 dark:text-zinc-400 truncate pr-2">
                              {lastMsg 
                                ? lastMsg.message_type === 'image' 
                                  ? '📷 Photo' 
                                  : lastMsg.message_type === 'video'
                                    ? '📹 Video'
                                    : lastMsg.message_type === 'audio'
                                      ? '🎵 Voice Note'
                                      : lastMsg.message_type === 'document'
                                        ? '📄 Document'
                                        : lastMsg.content
                                : 'Tap to start chatting...'}
                            </p>
                          )}
                          {unreadCount > 0 && (
                            <span className="w-5 h-5 bg-wa-green text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          /* Settings View */
          <div className="flex-1 flex flex-col justify-between safe-pt safe-pb">
            <div>
              <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <button 
                  onClick={() => setActiveTab('chats')}
                  className="text-ios-blue text-sm font-semibold"
                >
                  Done
                </button>
              </div>

              {/* Profile Card */}
              <div className="p-6 flex flex-col items-center border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/40">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md ${getAvatarColor(user.id)} mb-3`}>
                  {getInitials(user.username)}
                </div>
                <h2 className="text-base font-semibold text-gray-800 dark:text-white">{user.username}</h2>
                <p className="text-xs text-gray-400 dark:text-zinc-500">{user.phone_number}</p>
              </div>

              {/* Edit Username Form */}
              <form onSubmit={handleUpdateProfile} className="p-4 space-y-3">
                <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Display Username</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 bg-gray-100 dark:bg-zinc-800 border-none outline-none rounded-lg p-2 text-sm text-gray-900 dark:text-white font-medium"
                    placeholder="Enter display name"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-ios-blue hover:opacity-85 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-opacity"
                  >
                    Save
                  </button>
                </div>
                {profileSuccess && <p className="text-[10px] text-green-500 font-semibold">Username updated successfully!</p>}
                {profileError && <p className="text-[10px] text-red-500 font-semibold">{profileError}</p>}
              </form>
            </div>

            {/* Logout */}
            <div className="p-4 pb-8">
              <button
                onClick={logout}
                className="w-full bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/40 font-semibold py-2.5 px-4 rounded-xl text-sm border border-red-200 dark:border-red-900/30 transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM TAB NAVIGATION BAR */}
        <div className="border-t border-gray-100 dark:border-zinc-800 flex justify-around items-center py-2 bg-gray-50/80 dark:bg-zinc-900/60 backdrop-blur-md safe-pb">
          <button 
            onClick={() => setActiveTab('chats')}
            className={`flex flex-col items-center ${activeTab === 'chats' ? 'text-ios-blue' : 'text-gray-400 dark:text-zinc-500'}`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-[9px] font-medium uppercase">Chats</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center ${activeTab === 'settings' ? 'text-ios-blue' : 'text-gray-400 dark:text-zinc-500'}`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[9px] font-medium uppercase">Settings</span>
          </button>
        </div>
      </div>

      {/* RIGHT PANE: CHAT CONVERSATION */}
      <div 
        className={`flex-1 flex flex-col h-full bg-[#efeae2] dark:bg-[#0b141a] ${
          selectedContact ? 'flex' : 'hidden md:flex'
        }`}
      >
        {selectedContact ? (
          <>
            {/* Conversation Header */}
            <div className="px-4 py-2 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center safe-pt">
              <div className="flex items-center min-w-0">
                <button
                  onClick={() => setSelectedContact(null)}
                  className="mr-2 text-ios-blue md:hidden focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ${getAvatarColor(selectedContact.id)}`}>
                  {getInitials(selectedContact.username)}
                </div>

                <div className="ml-3 min-w-0">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {selectedContact.username}
                  </h2>
                  {typingUsers[selectedContact.id] ? (
                    <p className="text-[10px] text-wa-green font-semibold animate-pulse truncate">
                      typing...
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium truncate">
                      {selectedContact.phone_number}
                    </p>
                  )}
                </div>
              </div>

              {/* Call Mock Icons */}
              <div className="flex items-center space-x-4 text-ios-blue">
                <button onClick={() => handleStartCall('video')} className="hover:opacity-75 focus:outline-none" title="Video Call">
                  <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button onClick={() => handleStartCall('voice')} className="hover:opacity-75 focus:outline-none" title="Voice Call">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Message Pane Grid with Custom WhatsApp BG */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 wa-chat-bg">
              {messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <div className="bg-white/80 dark:bg-zinc-900/80 px-4 py-2 rounded-lg text-xs font-semibold text-gray-500 dark:text-zinc-400 shadow-sm max-w-xs text-center border border-gray-200/50 dark:border-zinc-800/50">
                    🔒 Messages are sent securely. Tap to start chatting.
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSelf = msg.sender_id === user.id;
                  const isMedia = msg.message_type === 'image' || msg.message_type === 'video' || msg.message_type === 'audio' || msg.message_type === 'document';
                  const fileUrl = msg.isTemp ? msg.content : `${API_URL}${msg.content}`;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`rounded-xl shadow-sm text-sm relative overflow-hidden ${
                          isMedia 
                            ? 'p-0.5 max-w-[280px] bg-white dark:bg-zinc-800' 
                            : isSelf 
                              ? 'bg-wa-bubble-out text-gray-800 dark:bg-[#005c4b] dark:text-white rounded-tr-none px-3 py-1.5 max-w-[75%]'
                              : 'bg-wa-bubble-in text-gray-800 dark:bg-[#202c33] dark:text-white rounded-tl-none px-3 py-1.5 max-w-[75%]'
                        }`}
                      >
                        {isMedia ? (
                          <div className="relative rounded-lg overflow-hidden group">
                            {/* 1. Image Renderer */}
                            {msg.message_type === 'image' && (
                              <ImageBubble 
                                src={fileUrl}
                                alt="Uploaded Media"
                                isSelf={isSelf}
                                status={msg.status}
                                created_at={msg.created_at}
                                formatTime={formatTime}
                              />
                            )}

                            {/* 2. Video Renderer */}
                            {msg.message_type === 'video' && (
                              <VideoBubble 
                                src={fileUrl}
                                isSelf={isSelf}
                                status={msg.status}
                                created_at={msg.created_at}
                                formatTime={formatTime}
                              />
                            )}

                            {/* 3. Document Renderer */}
                            {msg.message_type === 'document' && (
                              <div className="p-0.5">
                                <DocumentBubble 
                                  src={fileUrl}
                                  filename={msg.isTemp ? msg.filename : msg.content.split('/').pop()}
                                  isSelf={isSelf}
                                  status={msg.status}
                                  created_at={msg.created_at}
                                  formatTime={formatTime}
                                />
                                <div className="flex items-center justify-end space-x-1 px-2 pb-1.5 pt-0.5 text-[9px] text-gray-400 dark:text-zinc-500 font-medium bg-white dark:bg-zinc-900 rounded-b-lg">
                                  <span>{formatTime(msg.created_at)}</span>
                                  {isSelf && (
                                    <span className="self-end">
                                      {msg.status === 'sent' && (
                                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                      {msg.status === 'delivered' && (
                                        <svg className="w-4.5 h-4.5 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                                          <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.496-.496L3.483 11l.5.5a.5.5 0 0 0 .708 0l3.5-3.5a.5.5 0 0 0 0-.708z"/>
                                          <path d="M6.253 11.377 12.354 5.276a.5.5 0 0 1 .708.708l-6.5 6.5a.5.5 0 0 1-.708 0L3.376 9.5a.5.5 0 0 1 .708-.708l2.169 2.169z"/>
                                        </svg>
                                      )}
                                      {msg.status === 'read' && (
                                        <svg className="w-4.5 h-4.5 text-sky-500 dark:text-sky-400 transition-colors duration-300" viewBox="0 0 16 16" fill="currentColor">
                                          <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.496-.496L3.483 11l.5.5a.5.5 0 0 0 .708 0l3.5-3.5a.5.5 0 0 0 0-.708z"/>
                                          <path d="M6.253 11.377 12.354 5.276a.5.5 0 0 1 .708.708l-6.5 6.5a.5.5 0 0 1-.708 0L3.376 9.5a.5.5 0 0 1 .708-.708l2.169 2.169z"/>
                                        </svg>
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* 4. Audio Renderer */}
                            {msg.message_type === 'audio' && (
                              <div className="p-2 min-w-[240px] bg-gray-50 dark:bg-zinc-900/60 rounded-lg">
                                <audio src={fileUrl} controls className="w-full" />
                                <div className="flex items-center justify-end space-x-1 mt-1 text-[9px] text-gray-400 dark:text-zinc-500 font-medium">
                                  <span>{formatTime(msg.created_at)}</span>
                                  {isSelf && (
                                    <span className="ml-1 self-end">
                                      {msg.status === 'sent' && (
                                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                      {msg.status === 'delivered' && (
                                        <svg className="w-4.5 h-4.5 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                                          <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.496-.496L3.483 11l.5.5a.5.5 0 0 0 .708 0l3.5-3.5a.5.5 0 0 0 0-.708z"/>
                                          <path d="M6.253 11.377 12.354 5.276a.5.5 0 0 1 .708.708l-6.5 6.5a.5.5 0 0 1-.708 0L3.376 9.5a.5.5 0 0 1 .708-.708l2.169 2.169z"/>
                                        </svg>
                                      )}
                                      {msg.status === 'read' && (
                                        <svg className="w-4.5 h-4.5 text-sky-500" viewBox="0 0 16 16" fill="currentColor">
                                          <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.496-.496L3.483 11l.5.5a.5.5 0 0 0 .708 0l3.5-3.5a.5.5 0 0 0 0-.708z"/>
                                          <path d="M6.253 11.377 12.354 5.276a.5.5 0 0 1 .708.708l-6.5 6.5a.5.5 0 0 1-.708 0L3.376 9.5a.5.5 0 0 1 .708-.708l2.169 2.169z"/>
                                        </svg>
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Upload Loading indicator overlay */}
                            {msg.isTemp && (
                              <div className="absolute inset-0 bg-black/35 backdrop-blur-[0.5px] flex items-center justify-center z-20">
                                {msg.isError ? (
                                  <div className="text-red-500 text-[10px] font-bold bg-white/95 dark:bg-zinc-900/95 rounded-full px-2.5 py-1 flex items-center space-x-1 shadow-md">
                                    <span>⚠️ Failed</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-2 text-white bg-black/60 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm">
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Uploading...</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Standard Text bubble */
                          <>
                            <p className="leading-snug break-words">{msg.content}</p>
                            
                            {/* Time stamp & ticks */}
                            <div className="flex items-center justify-end space-x-1 mt-1 text-[9px] text-gray-400 dark:text-zinc-400 font-medium">
                              <span>{formatTime(msg.created_at)}</span>
                              {isSelf && (
                                <span className="ml-1 self-end">
                                  {msg.status === 'sent' && (
                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                  {msg.status === 'delivered' && (
                                    <svg className="w-4.5 h-4.5 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                                      <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.496-.496L3.483 11l.5.5a.5.5 0 0 0 .708 0l3.5-3.5a.5.5 0 0 0 0-.708z"/>
                                      <path d="M6.253 11.377 12.354 5.276a.5.5 0 0 1 .708.708l-6.5 6.5a.5.5 0 0 1-.708 0L3.376 9.5a.5.5 0 0 1 .708-.708l2.169 2.169z"/>
                                    </svg>
                                  )}
                                  {msg.status === 'read' && (
                                    <svg className="w-4.5 h-4.5 text-sky-500 dark:text-sky-400 transition-colors duration-300" viewBox="0 0 16 16" fill="currentColor">
                                      <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.496-.496L3.483 11l.5.5a.5.5 0 0 0 .708 0l3.5-3.5a.5.5 0 0 0 0-.708z"/>
                                      <path d="M6.253 11.377 12.354 5.276a.5.5 0 0 1 .708.708l-6.5 6.5a.5.5 0 0 1-.708 0L3.376 9.5a.5.5 0 0 1 .708-.708l2.169 2.169z"/>
                                    </svg>
                                  )}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Conversation Typing Bar Footer */}
            <form 
              onSubmit={handleSendMessage}
              className="px-3 py-2.5 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800/80 flex items-center space-x-3 safe-pb"
            >
              <button 
                type="button" 
                className="text-ios-blue hover:opacity-75 focus:outline-none"
                onClick={() => setShowAttachmentSheet(true)}
              >
                <svg className="w-6.5 h-6.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>

              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Type a message"
                className="flex-1 bg-gray-100 dark:bg-zinc-800/60 border border-gray-200/50 dark:border-zinc-800/50 rounded-full px-4 py-1.5 text-sm outline-none placeholder-gray-400 text-gray-900 dark:text-white"
              />

              {inputText.trim() ? (
                <button
                  type="submit"
                  className="bg-ios-blue text-white rounded-full w-8 h-8 flex items-center justify-center hover:opacity-85 shadow-sm active:scale-[0.98] transition-transform focus:outline-none"
                >
                  <svg className="w-4 h-4 text-white transform rotate-45 mr-[2px]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              ) : (
                <button 
                  type="button" 
                  className="text-ios-blue hover:opacity-75 focus:outline-none"
                  onClick={() => alert("Voice recording mock.")}
                >
                  <svg className="w-6.5 h-6.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              )}
            </form>
          </>
        ) : (
          /* Empty Splash View */
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-center bg-gray-50 dark:bg-zinc-950 no-select">
            <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-wa-green flex items-center justify-center mb-6 shadow-sm">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2">crookshanks for Web</h1>
            <p className="text-gray-400 dark:text-zinc-500 text-xs max-w-sm leading-relaxed">
              Send and receive messages instantly. Select a contact from the sidebar or settings to initiate secure communication.
            </p>
            <div className="mt-8 text-[10px] text-gray-400/80 dark:text-zinc-600 font-semibold border-t border-gray-100 dark:border-zinc-900 pt-4 w-48">
              🔒 Phase 3 Active
            </div>
          </div>
        )}
      </div>

      {/* iOS Sliding Bottom Action Sheet Modal for Phase 3 */}
      {showAttachmentSheet && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40 dark:bg-black/60 backdrop-blur-[1.5px] transition-all duration-300">
          <div className="flex-1" onClick={() => setShowAttachmentSheet(false)} />
          <div className="bg-gray-100/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-t-2xl px-4 pt-4 pb-6 space-y-3 shadow-2xl max-w-md mx-auto w-full border-t border-gray-200/50 dark:border-zinc-800/50 animate-slide-up">
            <div className="bg-white dark:bg-zinc-950/80 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-zinc-800/60 shadow-sm">
              <button 
                type="button" 
                onClick={() => {
                  triggerFileSelect("image/*,video/*,audio/*");
                  setShowAttachmentSheet(false);
                }}
                className="w-full px-4 py-3.5 text-left text-sm font-semibold text-ios-blue active:bg-gray-50 dark:active:bg-zinc-900 flex items-center space-x-3"
              >
                <svg className="w-5 h-5 text-ios-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Photo & Video Library</span>
              </button>
              <button 
                type="button"
                onClick={() => {
                  triggerFileSelect(".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,text/plain");
                  setShowAttachmentSheet(false);
                }}
                className="w-full px-4 py-3.5 text-left text-sm font-semibold text-ios-blue active:bg-gray-50 dark:active:bg-zinc-900 flex items-center space-x-3"
              >
                <svg className="w-5 h-5 text-ios-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Document</span>
              </button>
            </div>
            
            <button 
              type="button" 
              onClick={() => setShowAttachmentSheet(false)}
              className="w-full bg-white dark:bg-zinc-950/80 hover:opacity-95 text-red-500 font-bold py-3.5 rounded-xl text-center text-sm shadow-sm active:scale-[0.99] transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* iOS Call Screen Overlay for Phase 4 */}
      {callState !== 'idle' && (
        <div className="fixed inset-0 z-50 bg-[#0b141a] text-white flex flex-col justify-between items-center py-12 px-6 safe-bottom animate-fade-in font-sans">
          {/* Background for Video Call */}
          {callType === 'video' && callState === 'connected' && (
            <div className="absolute inset-0 z-0 bg-black">
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              {/* Float-anchored mini window for local camera */}
              {localStream && (
                <div className="absolute top-6 right-6 w-28 h-40 rounded-2xl border border-white/20 shadow-2xl overflow-hidden z-20 bg-zinc-900">
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {/* Main Calling Content Info */}
          <div className="z-10 flex flex-col items-center space-y-4 w-full text-center mt-12">
            {/* Blinking Call state / Type */}
            <div className="flex items-center space-x-2 bg-white/10 px-3.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase backdrop-blur-md text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>WhatsApp {callType === 'video' ? 'Video' : 'Voice'} Call</span>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight mt-2">
              {callPartner?.username || 'WhatsApp Contact'}
            </h2>
            
            {/* Subtitle call status */}
            <p className="text-sm text-zinc-400 font-medium tracking-wide">
              {callState === 'ringing_out' && <span className="animate-pulse">Calling...</span>}
              {callState === 'ringing_in' && <span className="animate-pulse">Ringing...</span>}
              {callState === 'connected' && (
                <span className="font-mono text-emerald-500 font-semibold">
                  {formatDuration(callDuration)}
                </span>
              )}
              {callState === 'ended' && <span>Call Ended</span>}
            </p>

            {/* Centralized circular contact photo */}
            {(callType === 'voice' || callState !== 'connected') && (
              <div className="mt-8 flex items-center justify-center">
                {callPartner?.profile_image ? (
                  <img 
                    src={callPartner.profile_image} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover border-2 border-white/20 shadow-xl animate-pulse"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-zinc-800 border-2 border-white/20 flex items-center justify-center text-3xl font-bold text-white shadow-xl animate-pulse">
                    {(callPartner?.username || '?').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom actions panel */}
          <div className="z-10 w-full max-w-sm flex flex-col items-center space-y-6 px-4">
            {/* Calling actions controls */}
            <div className="flex items-center justify-center space-x-6 w-full">
              {/* Mute button */}
              <button 
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isMuted 
                    ? 'bg-white text-zinc-950 scale-105 shadow-lg' 
                    : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-white active:scale-95'
                }`}
              >
                {isMuted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>

              {/* Decline / Hangup button */}
              <button 
                onClick={() => handleEndCall(true)}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-all shadow-lg active:scale-95"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 9c-2.2 0-4.3.3-6.2.9C5.3 10.1 5 10.6 5 11.2v2.7c0 .6.4 1.1 1 1.2 1.9.4 4 .6 6 .6s4.1-.2 6-.6c.6-.1 1-.6 1-1.2v-2.7c0-.6-.3-1.1-.8-1.3C16.3 9.3 14.2 9 12 9z" />
                </svg>
              </button>

              {/* Accept / Speaker button */}
              {callState === 'ringing_in' ? (
                <button 
                  onClick={handleAcceptCall}
                  className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white transition-all shadow-lg active:scale-95 animate-bounce"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.1-.03-.21-.02-.3.04l-2.5 2.5c-2.83-1.44-5.15-3.76-6.59-6.59l2.5-2.5c.08-.06.09-.17.06-.27C9.2 7.05 9 5.85 9 4.6c0-.28-.22-.5-.5-.5H4.5c-.28 0-.5.22-.5.5 0 9.39 7.61 17 17 17 .28 0 .5-.22.5-.5v-4c0-.28-.22-.5-.5-.5z" />
                  </svg>
                </button>
              ) : (
                <button 
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isSpeakerOn 
                      ? 'bg-white text-zinc-950 scale-105 shadow-lg' 
                      : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-white active:scale-95'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9.5H4.5v5h3.25L12 18.75z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
