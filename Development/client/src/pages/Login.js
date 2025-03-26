import React, { useState, useEffect } from 'react';
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
    setLoginMessage('');
  };

  const login = async (event) => {
    event.preventDefault();
    setLoginSubmitted(true);
    
    try {
      const response = await axios.post(`${process.env.BACKEND_URL}/login`, {
        username: usernameLogin,
        password: passwordLogin
      }, 
      { withCredentials: true });

      setLoginMessage({ type: 'success', message: response.data });
      navigate('/dashboard'); // Redirect to dashboard after successful login
    } catch (error) {
      if (error.response) {
        setLoginMessage({ type: 'error', message: error.response.data });
      } else {
        setLoginMessage({ type: 'error', message: 'An error occurred' });
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
      <button className='btn'>Login</button>
      <button className="btn" type="button" onClick={resetLoginForm}>Reset</button>

        {loginSubmitted && loginMessage && (
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