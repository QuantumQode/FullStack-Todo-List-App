import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [usernameLogin, setUsernameLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');
  const [loginMessage, setLoginMessage] = useState({ type: '', message: '' });
  const [loginSubmitted, setLoginSubmitted] = useState(false);
  const navigate = useNavigate();

  const resetLoginForm = () => {
    setUsernameLogin('');
    setPasswordLogin('');
    setLoginMessage({ type: '', message: '' });
    setLoginSubmitted(false);
  };

  const login = async (event) => {
    event.preventDefault();
    setLoginSubmitted(true);
    
    // Validate input
    if (!usernameLogin || !passwordLogin) {
      setLoginMessage({ type: 'error', message: 'Username and password are required' });
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:3001/auth/login', {
        username: usernameLogin,
        password: passwordLogin
      }, { withCredentials: true });

      // Store the token in localStorage for non-cookie use cases
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      // Store user info in localStorage
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      setLoginMessage({ 
        type: 'success', 
        message: response.data.message || 'Login successful'
      });
      
      // Navigate immediately - route protection will handle redirects
      navigate('/dashboard');
    } catch (error) {
      if (error.response) {
        setLoginMessage({ type: 'error', message: error.response.data });
      } else {
        setLoginMessage({ type: 'error', message: 'Connection error. Please try again.' });
      }
    }
  };

  return (
    <form className="FormContainer" onSubmit={login}>
      <h1>Login</h1>
      
      <label>Username</label>
      <input 
        type="text"
        placeholder="Enter Username"
        value={usernameLogin}
        onChange={(e) => setUsernameLogin(e.target.value)}
        required
      />
      
      <label>Password</label>
      <input 
        type="password"
        placeholder="Enter Password"
        value={passwordLogin}
        onChange={(e) => setPasswordLogin(e.target.value)}
        required
      />
      
      <button className="btn" type="submit">Login</button>
      <button className="btn" type="button" onClick={resetLoginForm}>Reset</button>

      {loginSubmitted && loginMessage.message && (
        <div className={loginMessage.type === 'error' ? 'errorMessage' : 'successMessage'}>
          {loginMessage.message}
        </div>
      )}

      <p className="switchForm">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </form>
  );
}

export default Login;