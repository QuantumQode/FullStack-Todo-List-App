// This file is the main file of the react app. It contains the form for user registration.
// The import statement at the top imports the useState and Axios hooks from the react and axios libraries.
import React, { useState } from 'react';
// Axios is a library that allows you to make HTTP requests from the browser.
import Axios, { all } from 'axios';
// App.css is a CSS file that contains styles for the app.
import './App.css';

function App() {

  // Registration state variables
  // These 2 lines create state variables usernameReg and passwordReg, and functions setUsernameReg and setPasswordReg to update them.
  const [usernameReg, setUsernameReg] = useState('')
  const [passwordReg, setPasswordReg] = useState('')
  // This line creates a state variable registerMessage and a function setRegisterMessage to update it.
  const [registerMessage, setRegisterMessage] = useState({ type: '', message: '' });
  // This line creates a state variable registerSubmit and a function setRegisterSubmit to update it.
  const [registerSubmitted, setRegisterSubmitted] = useState(false);


  // Login state variables
  // These 2 lines create state variables usernameLogin and passwordLogin, and functions setUsernameLogin and setPasswordLogin to update them.
  const [usernameLogin, setUsernameLogin] = useState('')
  const [passwordLogin, setPasswordLogin] = useState('')
  // This line creates a state variable loginMessage and a function setLoginMessage to update it.
  const [loginMessage, setLoginMessage] = useState({ type: '', message: '' });
  // This line creates a state variable loginSubmit and a function setLoginSubmit to update it.
  const [loginSubmitted, setLoginSubmitted] = useState(false);


  // This function checks the username meets requirements by creating an array of errors.
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
      errors.push('Username cannot contain consecutive underscores');
    }
    return errors;
  }


  // This function checks password meets requirements by creating an array of errors.
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

  // This function formats the errors into a list of JSX elements.
  const formatErrors = (errors) => {
    return errors.map((error, index) => (
      <span key={index}>
        {error}
        <br />
        </span>
    ));
  };

   // Reset function for the registration form
   const resetRegisterForm = () => {
    setUsernameReg('');
    setPasswordReg('');
    setRegisterMessage('');
  };

  // Reset function for the login form
  const resetLoginForm = () => {
    setUsernameLogin('');
    setPasswordLogin('');
    setLoginMessage('');
  };
  

  // Register function sends POST request to server to register user.
  const register = () => {
    setRegisterSubmitted(true);
    const usernameErrors = validateUsername(usernameReg);
    const passwordErrors = validatePassword(passwordReg);
    const allErrors = [...usernameErrors, ...passwordErrors];

    if (allErrors.length > 0) {
      setRegisterMessage({ type: 'error', message: formatErrors(allErrors) });
      return;
    }

    Axios.post('http://localhost:3001/register', {
      username: usernameReg,
      password: passwordReg
    }).then((response) => {
      console.log(response);
      setRegisterMessage({ type: 'success', message: 'User registered successfully' });
      setUsernameReg('');
      setPasswordReg('');
    }).catch((error) => {
      if (error.response) {
        setRegisterMessage({ type: 'error', message: error.response.data });
      } else {
        setRegisterMessage({ type: 'error', message: 'An error occurred' });
      }
    });
  };

  // Login function sends POST request to server to log user in.
  const login = () => {
    setLoginSubmitted(true);
    Axios.post('http://localhost:3001/login', {
      username: usernameLogin,
      password: passwordLogin
    }).then((response) => {
      // This line logs the response from the server to the console which is plain script.
      setLoginMessage({ type: 'success', message: response.data });
    }).catch((error) => {
      // Handling error
      if (error.response) {
        setLoginMessage({ type: 'error', message: error.response.data });
      } else {
        setLoginMessage({ type: 'error', message: 'An error occurred' });
      }
  });
};
  // This block of code contains the JSX for the registration form.
  return (
    <div className="App">
      {/* This div contains the registration form. */}
      <div className="FormContainer">
        <h1>Register</h1>
        {/* This input field allows the user to enter their username. */}
        <label>Username</label>
        <input type="text" 
        placeholder="Enter Username" 
        value={usernameReg} 
        onChange = {(e) => {setUsernameReg(e.target.value)}} />
        {/* This input field allows the user to enter their password. */}
        <label>Password</label>
        <input type="password" 
        placeholder="Enter Password" 
        value={passwordReg} 
        onChange = {(e) => {setPasswordReg(e.target.value)}} />
        
        {/* This button calls the register function when clicked. */}
        <button className='btn' onClick={register}>Register</button>
        <button className="btn" onClick={resetRegisterForm}>Reset</button>
        {registerSubmitted && registerMessage && (
          <div className={registerMessage.type === 'error' ? 'errorMessage' : 'successMessage'}>
            {registerMessage.message}
          </div>
        )}
      </div>


      {/* This div contains the login form. */}
      <div className="FormContainer"> 
        <h1>Login</h1>
        {/* This input field allows the user to enter their username. */}
        <label>Username</label>
        <input type="text" 
        placeholder="Enter Username" 
        value={usernameLogin}
        onChange = {(e) => {setUsernameLogin(e.target.value)}}/>
        {/* This input field allows the user to enter their password. */}
        <label>Password</label>
        <input type="password" 
        placeholder="Enter Password"
        value={passwordLogin}
        onChange={(e) => {setPasswordLogin(e.target.value)}} />

        {/* This button logs the user in when clicked. */}
        <button className='btn' onClick={login}>Login</button>
        {/* This button resets the login form when clicked. */}
        <button className="btn" onClick={resetLoginForm}>Reset</button>
        {loginSubmitted && loginMessage && (
          <div className={loginMessage.type === 'error' ? 'errorMessage' : 'successMessage'}>
            {loginMessage.message}
          </div>
        )}
      </div>
    </div>

  );
}

export default App;
