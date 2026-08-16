import { useEffect, useRef, useState } from 'react';

export default function OTP({ otpLength = 6, value = '', onChange }) {
  const [otpFields, setOtpFields] = useState(new Array(otpLength).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    const nextFields = Array.from({ length: otpLength }, (_, index) => value[index] || '');
    setOtpFields(nextFields);
  }, [value, otpLength]);

  const updateOtp = (nextFields) => {
    setOtpFields(nextFields);
    onChange?.(nextFields.join(''));
  };

  const handleKeyDown = (event, index) => {
    const key = event.key;

    if (key === 'ArrowLeft') {
      if (index > 0) inputRefs.current[index - 1]?.focus();
      return;
    }

    if (key === 'ArrowRight') {
      if (index + 1 < otpFields.length) inputRefs.current[index + 1]?.focus();
      return;
    }

    if (key === 'Backspace') {
      const nextFields = [...otpFields];
      nextFields[index] = '';
      updateOtp(nextFields);

      if (index > 0) inputRefs.current[index - 1]?.focus();
      return;
    }

    if (!/^\d$/.test(key)) {
      return;
    }

    const nextFields = [...otpFields];
    nextFields[index] = key;
    updateOtp(nextFields);

    if (index + 1 < otpFields.length) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const pastedValue = event.clipboardData.getData('text');
    const digits = pastedValue.match(/\d/g);

    if (!digits) return;

    const nextFields = [...otpFields];

    for (let index = 0; index < otpLength && digits[index]; index += 1) {
      nextFields[index] = digits[index];
    }

    updateOtp(nextFields);

    const nextFocusIndex = Math.min(digits.length, otpLength - 1);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      {otpFields.map((valueItem, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          value={valueItem}
          type="text"
          maxLength={1}
          inputMode="numeric"
          autoComplete="one-time-code"
          className="h-12 w-12 rounded-xl border-2 border-slate-300 bg-slate-50 text-center text-xl font-semibold text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          onKeyDown={(event) => handleKeyDown(event, index)}
          onPaste={handlePaste}
          onChange={() => {}}
        />
      ))}
    </div>
  );
}
