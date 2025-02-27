import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [usernameReg, setUsernameReg] = useState('');
  const [passwordReg, setPasswordReg] = useState('');
  const [registerMessage, setRegisterMessage] = useState({ type: '', message: '' });
  const [registerSubmitted, setRegisterSubmitted] = useState(false);
  const navigate = useNavigate();

  // Validation function for username
  const validateUsername = (username) => {
    const errors = [];
    const minLength = 3;
    const maxLength = 20;
    const validCharacters = /^[a-zA-Z0-9_]+$/;

    if (!username || username.trim() === '') {
      errors.push('Username is required');
    }
    if (username.length < minLength) {
      errors.push('Username must be at least 3 characters long');
    }
    if (username.length > maxLength) {
      errors.push('Username must be at most 10 characters long');
    }
    if (!validCharacters.test(username)) {
      errors.push('Username must contain only letters, numbers and underscores');
    }
    if (username.includes(' ')) {
      errors.push('Username cannot contain spaces');
    }
    return errors;
  };

  // Validation function for password
  const validatePassword = (password) => {
    const errors = [];
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);

    if (password.length < minLength) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasNumber) {
      errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character');
    }
    return errors;
  };

  // Format errors into JSX
  const formatErrors = (errors) => {
    return errors.map((error, index) => (
      <span key={index}>
        {error}
        <br />
      </span>
    ));
  };

  // Reset form function
  const resetRegisterForm = () => {
    setUsernameReg('');
    setPasswordReg('');
    setRegisterMessage({ type: '', message: '' });
    setRegisterSubmitted(false);
  };

  // Register function
  const register = () => {
    setRegisterSubmitted(true);
    const usernameErrors = validateUsername(usernameReg);
    const passwordErrors = validatePassword(passwordReg);
    const allErrors = [...usernameErrors, ...passwordErrors];

    if (allErrors.length > 0) {
      setRegisterMessage({ type: 'error', message: formatErrors(allErrors) });
      return;
    }

    axios.post('http://localhost:3001/auth/register', {
      username: usernameReg,
      password: passwordReg
    })
    .then((response) => {
      setRegisterMessage({ type: 'success', message: 'User registered successfully' });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    })
    .catch((error) => {
      if (error.response) {
        setRegisterMessage({ type: 'error', message: error.response.data });
      } else {
        setRegisterMessage({ type: 'error', message: 'An error occurred' });
      }
    });
  };

  return (
    <div className="FormContainer">
      <h1>Register</h1>
      <label>Username</label>
      <input 
        type="text"
        placeholder="Enter Username"
        value={usernameReg}
        onChange={(e) => setUsernameReg(e.target.value)}
      />
      <label>Password</label>
      <input 
        type="password"
        placeholder="Enter Password"
        value={passwordReg}
        onChange={(e) => setPasswordReg(e.target.value)}
      />
      <button className='btn' onClick={register}>Register</button>
      <button className="btn" onClick={resetRegisterForm}>Reset</button>

      
      {registerSubmitted && registerMessage && (
        <div className={registerMessage.type === 'error' ? 'errorMessage' : 'successMessage'}>
          {registerMessage.message}
        </div>
      )}
      <p className="switchForm">
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default Register;