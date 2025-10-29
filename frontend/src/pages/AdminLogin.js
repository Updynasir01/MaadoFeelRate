import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const success = login(username, password);
      if (success) {
        navigate('/admin');
      } else {
        setError('Invalid username or password');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4">
      {/* Luxury Background Pattern */}
      <div className="absolute inset-0 bg-luxury-pattern opacity-40"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary opacity-5 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Luxury Login Card */}
        <div className="card-luxury rounded-3xl p-10 slide-up">
          <div className="text-center mb-8">
            <div className="w-20 h-1 gradient-gold mx-auto mb-4 rounded-full"></div>
            <h1 className="text-4xl font-display font-bold text-primary mb-2">
              Admin Login
            </h1>
            <p className="text-gray-600 font-light">
              Access your analytics dashboard
            </p>
            <div className="w-20 h-1 gradient-gold mx-auto mt-4 rounded-full"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-primary">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:ring-4 focus:ring-accent focus:ring-opacity-10 focus:outline-none transition-smooth text-gray-700"
                placeholder="Enter username"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-primary">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:ring-4 focus:ring-accent focus:ring-opacity-10 focus:outline-none transition-smooth text-gray-700"
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-luxury text-white py-4 px-6 rounded-xl text-lg font-semibold tracking-wide transition-premium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

