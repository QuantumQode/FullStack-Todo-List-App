import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch user data using the token
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      
      try {
        // Make API call to check token validity
        const response = await axios.get('http://localhost:3001/auth/check-session', {
          headers: {
            'x-access-token': token
          },
          withCredentials: true
        });
        
        if (response.data.loggedIn) {
          setUser(response.data.user);
        } else {
          setError('Session expired');
          // Let the protected route handle the redirect
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to fetch user data');
        // Let the protected route handle the redirect
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const handleLogout = async () => {
    try {
      // Clear token cookie on server
      await axios.post('http://localhost:3001/auth/logout', {}, {
        withCredentials: true
      });
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if server logout fails, clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="taskContainer">
        <h1>Loading...</h1>
      </div>
    );
  }
  
  // Show error state
  if (error || !user) {
    return (
      <div className="taskContainer">
        <h1>Error</h1>
        <p>{error || 'User data not available'}</p>
        <button 
          onClick={() => navigate('/login')}
          style={{ 
            padding: '10px 15px', 
            background: '#1e90ff', 
            border: 'none', 
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Return to Login
        </button>
      </div>
    );
  }
  
  return (
    <div className="taskContainer">
      <div className="username">
        Welcome, {user.username}
        <button 
          onClick={handleLogout} 
          style={{ 
            marginLeft: '10px', 
            padding: '5px 10px', 
            background: '#e74c3c', 
            border: 'none', 
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
      
      <h1>Dashboard</h1>
      <p>Welcome to your personal to-do list dashboard</p>
      
      {/* Placeholder for future to-do list functionality */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>Your tasks will appear here</p>
      </div>
    </div>
  );
}

export default Dashboard;