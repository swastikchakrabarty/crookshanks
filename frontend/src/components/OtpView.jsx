import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function OtpView({ phoneNumber, onVerified, onBack }) {
  const { verifyOtp, authError } = useAuth();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle keypresses on the native keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (submitting) return;

      if (e.key >= '0' && e.key <= '9') {
        if (code.length < 6) {
          setCode((prev) => prev + e.key);
        }
      } else if (e.key === 'Backspace') {
        setCode((prev) => prev.slice(0, -1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, submitting]);

  // Trigger verification once code reaches 6 digits
  useEffect(() => {
    if (code.length === 6) {
      handleVerify();
    }
  }, [code]);

  const handleVerify = async () => {
    setSubmitting(true);
    setError('');

    try {
      await verifyOtp(phoneNumber, code);
      onVerified();
    } catch (err) {
      setError(err.message || 'Verification failed');
      // Clear code on failure so they can try again
      setCode('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeypadPress = (num) => {
    if (submitting) return;
    if (code.length < 6) {
      setCode((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    if (submitting) return;
    setCode((prev) => prev.slice(0, -1));
  };

  // iOS Keypad Button details
  const keys = [
    { num: '1', letters: ' ' },
    { num: '2', letters: 'A B C' },
    { num: '3', letters: 'D E F' },
    { num: '4', letters: 'G H I' },
    { num: '5', letters: 'J K L' },
    { num: '6', letters: 'M N O' },
    { num: '7', letters: 'P Q R S' },
    { num: '8', letters: 'T U V' },
    { num: '9', letters: 'W X Y Z' },
  ];

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col justify-between bg-white dark:bg-zinc-950 p-6 safe-pt safe-pb no-select">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-800">
        <button
          onClick={onBack}
          className="text-ios-blue text-base flex items-center space-x-1 hover:opacity-85"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Verify OTP</h1>
        <div className="w-12"></div>
      </div>

      {/* Main OTP display area */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 max-h-[30vh]">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Verify Phone Number
        </h2>
        <p className="text-gray-500 dark:text-zinc-400 text-sm text-center mb-6">
          Enter the 6-digit code sent to <span className="font-semibold">{phoneNumber}</span>
        </p>

        {/* 6 code boxes */}
        <div className="flex space-x-2.5 justify-center mb-4">
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const digit = code[index] || '';
            const isActive = code.length === index && !submitting;
            return (
              <div
                key={index}
                className={`w-12 h-14 border rounded-xl flex items-center justify-center text-2xl font-semibold transition-all ${
                  isActive
                    ? 'border-ios-blue ring-2 ring-blue-100 dark:ring-blue-900/30'
                    : 'border-gray-200 dark:border-zinc-800'
                } bg-gray-50 dark:bg-zinc-900 text-gray-800 dark:text-gray-100`}
              >
                {digit}
                {isActive && (
                  <span className="animate-pulse w-[2px] h-6 bg-ios-blue block"></span>
                )}
              </div>
            );
          })}
        </div>

        {/* Error / Submitting statuses */}
        {submitting && (
          <div className="text-ios-blue text-xs font-semibold animate-pulse">
            Verifying code...
          </div>
        )}

        {(error || authError) && !submitting && (
          <div className="text-red-500 text-xs font-medium text-center">
            {error || authError}
          </div>
        )}
      </div>

      {/* iOS Keypad Grid */}
      <div className="w-full max-w-sm mx-auto grid grid-cols-3 gap-y-4 gap-x-6 justify-items-center pb-6">
        {keys.map((key) => (
          <button
            key={key.num}
            onClick={() => handleKeypadPress(key.num)}
            className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800/80 active:bg-gray-200 dark:active:bg-zinc-700 flex flex-col justify-center items-center cursor-pointer transition-colors shadow-sm"
          >
            <span className="text-2xl font-semibold text-gray-900 dark:text-white leading-tight">
              {key.num}
            </span>
            <span className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mt-[-2px]">
              {key.letters}
            </span>
          </button>
        ))}

        {/* Bottom row of keypad */}
        <div className="w-16 h-16 flex items-center justify-center"></div>
        <button
          onClick={() => handleKeypadPress('0')}
          className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800/80 active:bg-gray-200 dark:active:bg-zinc-700 flex justify-center items-center cursor-pointer transition-colors shadow-sm"
        >
          <span className="text-2xl font-semibold text-gray-900 dark:text-white">0</span>
        </button>
        <button
          onClick={handleDelete}
          className="w-16 h-16 rounded-full active:bg-gray-100 dark:active:bg-zinc-800/40 flex justify-center items-center cursor-pointer transition-colors text-gray-700 dark:text-gray-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414A2 2 0 0110.828 5H20a2 2 0 012 2v10a2 2 0 01-2 2h-9.172a2 2 0 01-1.414-.586L3 12z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
