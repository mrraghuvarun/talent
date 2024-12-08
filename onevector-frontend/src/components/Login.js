import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from './images/logo.png'; // Keep the left-side logo
import talentHubImage from './images/talenthub.png'; // Import the local image for branding
import oneVectorImage from './images/onevector.png'; // Import the "onevector" image

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState(''); // State to handle error messages

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset error on new login attempt

    try {
      // Send login request to the backend
      const response = await axios.post('https://jggetx2xqg.execute-api.us-east-1.amazonaws.com/dev/api/login', { email, password });

      if (response.status === 200) {
        const userData = response.data.user;
        const token = response.data.token; // Get the token from the response

        // Store user data and token in localStorage
        localStorage.setItem('user', JSON.stringify({ id: userData.id, role: userData.role, email: userData.email }));
        localStorage.setItem('token', token); // Store the token

        // Redirect based on user role
        if (userData.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (userData.role === 'power_user') {
          navigate('/power-user-dashboard');
        } else if (userData.role === 'user') {
          navigate('/user-dashboard');
        }
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your email or password.');
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left-side image section */}
      <div className="w-1/2 bg-blue-900 flex items-center justify-center">
        <img
          src={logo}
          alt="Logo"
          className="h-[600px] w-[600px] object-contain"
        />
      </div>

      {/* Login form section */}
      <div className="w-1/2 bg-blue-50 flex items-center justify-center">
        <div className="w-3/4 max-w-md">
          {/* TalentHub Branding */}
          <div className="flex flex-col items-center mb-8">
            <img
              src={talentHubImage} // Use local image instead of placeholder
              alt="TalentHub Logo"
              className="mr-2 h-34 w-64 object-contain" // Adjust height and width to around 250 pixels
            />
            <img
              src={oneVectorImage} // Use the "onevector" image
              alt="OneVector Logo"
              className="mt-4 h-11 w-64 object-contain" // Adjust size as needed
            />
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Login</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Welcome back. Please enter your credentials to continue.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-[#15BACD]"
              />
            </div>

            <div className="mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-[#15BACD]"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#15BACD] to-[#094DA2] text-white text-sm font-medium py-2 rounded-md transition duration-300"
            >
              Login
            </button>
          </form>

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default Login;