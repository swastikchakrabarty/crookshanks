import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const COUNTRIES = [
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷' },
  { name: 'Japan', code: '+81', flag: '🇯🇵' },
];

export default function LoginView({ onOtpSent, setPhoneNumberState }) {
  const { requestOtp, authError } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [localNumber, setLocalNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!localNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    const fullNumber = `${selectedCountry.code}${localNumber.replace(/[^\d]/g, '')}`;
    setSubmitting(true);
    setError('');

    try {
      await requestOtp(fullNumber);
      setPhoneNumberState(fullNumber);
      onOtpSent(); // transition screen
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col justify-between bg-white dark:bg-zinc-950 p-6 safe-pt safe-pb">
      {/* Top Header Row (iOS Style) */}
      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-800">
        <span className="text-gray-400 w-12 text-sm"></span>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Phone Number</h1>
        <button
          onClick={handleSubmit}
          disabled={submitting || !localNumber}
          className="text-ios-blue font-semibold text-base disabled:opacity-40 hover:opacity-85 transition-opacity"
        >
          {submitting ? 'Sending...' : 'Next'}
        </button>
      </div>

      {/* Main Body content */}
      <div className="flex-1 flex flex-col justify-start pt-10 px-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Enter Your Phone Number
        </h2>
        <p className="text-gray-500 dark:text-zinc-400 text-sm text-center mb-10 leading-relaxed">
          crookshanks will send an OTP verification code. Confirm your country code and enter your phone number.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Country Selection Box (iOS look) */}
          <div className="border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-gray-50 dark:bg-zinc-900">
            {/* Country Selector Dropdown Row */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-zinc-800 relative">
              <label className="text-sm font-medium text-gray-500 dark:text-zinc-400">Country</label>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{selectedCountry.name}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <select
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                value={selectedCountry.name}
                onChange={(e) => {
                  const country = COUNTRIES.find((c) => c.name === e.target.value);
                  if (country) setSelectedCountry(country);
                }}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.flag} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Code & Number Input Row */}
            <div className="flex items-center p-3">
              <div className="w-16 border-r border-gray-200 dark:border-zinc-800 pr-2 flex items-center justify-center text-gray-800 dark:text-gray-200 font-semibold text-lg">
                {selectedCountry.code}
              </div>
              <input
                type="tel"
                placeholder="Phone number"
                className="flex-1 pl-4 bg-transparent outline-none text-lg text-gray-900 dark:text-white font-semibold placeholder-gray-400"
                value={localNumber}
                onChange={(e) => setLocalNumber(e.target.value.replace(/[^\d]/g, ''))}
                autoFocus
              />
            </div>
          </div>

          {/* Error display */}
          {(error || authError) && (
            <div className="text-red-500 text-xs text-center mt-2 font-medium">
              {error || authError}
            </div>
          )}
        </form>
      </div>

      {/* Footer / Alternate Submit button */}
      <div className="px-4 pb-8 flex flex-col items-center">
        <button
          onClick={handleSubmit}
          disabled={submitting || !localNumber}
          className="w-full bg-ios-blue hover:bg-blue-600 active:scale-[0.99] disabled:opacity-40 disabled:scale-100 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all text-center"
        >
          {submitting ? 'Generating Verification Code...' : 'Next'}
        </button>
        <span className="text-xs text-gray-400 dark:text-zinc-500 mt-4 text-center">
          By continuing, you agree to the self-hosted Terms of Service.
        </span>
      </div>
    </div>
  );
}
