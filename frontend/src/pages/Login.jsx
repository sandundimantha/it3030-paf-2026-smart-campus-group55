import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Login() {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // The credentialResponse.credential is a Google-signed JWT
      // Store it so the Axios interceptor can attach it automatically
      localStorage.setItem('token', credentialResponse.credential);

      // Tell the backend to register/login the user
      const res = await api.post('/auth/login');
      
      // Save user info to localStorage for display around the app
      localStorage.setItem('user', JSON.stringify(res.data));

      // Redirect to the main dashboard
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your Google Client ID configuration.');
      localStorage.removeItem('token');
    }
  };

  const handleGoogleError = () => {
    alert('Google Sign-In was unsuccessful. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-blue-50 p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-brand-500/10 border border-gray-100/60 p-8 md:p-10">
        
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-blue-400 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-brand-500/30">
            S
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to SmartCampus</h2>
          <p className="text-gray-500 text-sm">Sign in with your university Google account to access the Operations Hub.</p>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            shape="rectangular"
            size="large"
            theme="outline"
            text="signin_with"
            width="360"
          />
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
