import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Simple authentication - In production, use proper auth with backend
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Default credentials (can be changed in production)
    const defaultUsername = 'admin';
    const defaultPassword = 'admin123';

    // Simulate API call delay
    setTimeout(() => {
      if (credentials.username === defaultUsername && credentials.password === defaultPassword) {
        // Store auth in localStorage
        localStorage.setItem('feelrate_auth', 'true');
        localStorage.setItem('feelrate_user', credentials.username);
        navigate('/admin');
      } else {
        setError('Invalid username or password');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Luxury Background */}
      <div className="absolute inset-0 bg-luxury-pattern opacity-20"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary opacity-10 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Luxury Login Card */}
        <div className="card-luxury rounded-3xl p-10 shadow-luxury-lg">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-block mb-6">
              <div className="w-16 h-1 gradient-gold mx-auto mb-4 rounded-full"></div>
              <h1 className="text-4xl font-display font-bold text-primary mb-2">
                Admin Portal
              </h1>
              <div className="w-16 h-1 gradient-gold mx-auto mt-4 rounded-full"></div>
            </div>
            <p className="text-gray-600 font-light">
              Sign in to access the analytics dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-primary">
                Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:ring-4 focus:ring-accent focus:ring-opacity-10 focus:outline-none transition-smooth text-gray-700"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-primary">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:ring-4 focus:ring-accent focus:ring-opacity-10 focus:outline-none transition-smooth text-gray-700"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-luxury text-white py-4 px-6 rounded-xl text-lg font-semibold tracking-wide transition-premium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none relative overflow-hidden mt-8"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Default Credentials Hint */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Default credentials: <span className="font-mono">admin / admin123</span>
            </p>
          </div>
        </div>

        {/* Back to Feedback Link */}
        <div className="text-center mt-6">
          <a 
            href="/" 
            className="text-sm text-gray-600 hover:text-accent transition-smooth font-medium"
          >
            ← Back to Feedback Form
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

