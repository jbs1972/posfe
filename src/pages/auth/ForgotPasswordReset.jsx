import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPasswordReset = () => {
  const navigate = useNavigate();
  const [email] = useState(sessionStorage.getItem('forgotPasswordEmail') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Please enter both password fields.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirm password do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/auth/reset-password', {
        userEmail: email.trim(),
        newPassword,
      });

      if (response?.data?.status === 200) {
        sessionStorage.removeItem('forgotPasswordEmail');
        setSuccessMessage('Password updated successfully. Redirecting to login...');

        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1200);

        return;
      }

      setErrorMessage(response?.data?.message || 'Unable to reset password. Please try again.');
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Unable to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col rounded-[2rem] border border-slate-200 bg-white px-8 py-10 shadow-xl shadow-slate-200/80 sm:px-10">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Step 3 of 3
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Reset Password
          </h1>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="forgotPasswordEmail" className="block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="forgotPasswordEmail"
              name="forgotPasswordEmail"
              type="email"
              value={email}
              readOnly
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-700 outline-none"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">
              New password
            </label>
            <div className="relative mt-2">
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 pr-20 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 inline-flex items-center text-sm font-semibold text-slate-600 transition hover:text-slate-900"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="Confirm new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {loading ? 'Updating…' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          <Link to="/login" className="font-semibold text-indigo-600 transition hover:text-indigo-700">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordReset;
