import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import OTP from '../../components/OTP.jsx';

const ForgotPasswordVerifyOtp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(sessionStorage.getItem('forgotPasswordEmail') || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!email.trim() || otp.length !== 6) {
      setErrorMessage('Please enter the 6-digit OTP sent to your email.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/auth/verify-otp', {
        userEmail: email.trim(),
        otp,
      });

      if (response?.data?.status === 200) {
        navigate('/forgot-password/reset');
        return;
      }

      setErrorMessage(response?.data?.message || 'OTP verification failed. Please try again.');
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col rounded-[2rem] border border-slate-200 bg-white px-8 py-10 shadow-xl shadow-slate-200/80 sm:px-10">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Step 2 of 3
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Verify OTP
          </h1>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-600">
          OTP sent to <span className="font-semibold text-slate-800">{email}</span>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="block text-center text-sm font-medium text-slate-700">
              Enter 6-digit OTP
            </label>
            <OTP otpLength={6} value={otp} onChange={setOtp} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {loading ? 'Verifying…' : 'Verify OTP'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          <Link to="/forgot-password" className="font-semibold text-indigo-600 transition hover:text-indigo-700">
            Change Email
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordVerifyOtp;
