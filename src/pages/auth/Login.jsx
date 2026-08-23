import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!userEmail.trim() || !userPassword.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        userEmail: userEmail.trim(),
        userPassword,
      });

      const responseData = response?.data;

      if (responseData?.status === 200 && responseData?.data?.token) {
        if (responseData.data.active === false) {
          setErrorMessage('Your account has been deactivated. Please contact your administrator.');
          setUserPassword('');
          return;
        }

        login({
          token: responseData.data.token,
          userId: responseData.data.userId,
          userName: responseData.data.userName,
          userEmail: responseData.data.userEmail,
          userRole: responseData.data.userRole,
        });

        navigate('/dashboard');
        return;
      }

      setErrorMessage('Invalid email or password.');
      setUserPassword('');
    } catch (error) {
      setErrorMessage('Invalid email or password.');
      setUserPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col rounded-[2rem] border border-slate-200 bg-white px-8 py-10 shadow-xl shadow-slate-200/80 sm:px-10">
        <div className="mb-8 text-center">
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Sign in to POS App
          </h1>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="userEmail" className="block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="userEmail"
              name="userEmail"
              type="email"
              autoComplete="email"
              value={userEmail}
              onChange={(event) => setUserEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="userPassword" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative mt-2">
              <input
                id="userPassword"
                name="userPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={userPassword}
                onChange={(event) => setUserPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 pr-20 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="Enter your password"
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

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="inline-flex items-center justify-center text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              Forgot Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
