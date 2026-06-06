import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginView from './components/LoginView';
import OtpView from './components/OtpView';
import ChatView from './components/ChatView';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [step, setStep] = useState('login'); // 'login', 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center bg-gray-50 dark:bg-zinc-950">
        {/* iOS Spinner look */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Loading crookshanks...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <ChatView />;
  }

  return (
    <div className="w-full h-full bg-gray-100 dark:bg-zinc-900 flex justify-center items-center">
      {/* On desktop: show a simulated mobile device frame for a neat demo feel. On mobile: fit screen perfectly. */}
      <div className="w-full h-full md:max-w-md md:max-h-[850px] md:rounded-3xl md:shadow-2xl overflow-hidden bg-white dark:bg-zinc-950 md:border md:border-gray-200/80 dark:md:border-zinc-800/80">
        {step === 'login' ? (
          <LoginView
            setPhoneNumberState={setPhoneNumber}
            onOtpSent={() => setStep('otp')}
          />
        ) : (
          <OtpView
            phoneNumber={phoneNumber}
            onVerified={() => setStep('login')} // Will auto-redirect to ChatView via AuthContext
            onBack={() => setStep('login')}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
