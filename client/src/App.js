// This file is the main file of the react app. It contains the form for user registration.
// The import statement at the top imports the useState and Axios hooks from the react and axios libraries.
import React, { useState } from 'react';
// Axios is a library that allows you to make HTTP requests from the browser.
import Axios from 'axios';
// App.css is a CSS file that contains styles for the app.
import './App.css';

function App() {

  // These 2 lines create state variables usernameReg and passwordReg, and functions setUsernameReg and setPasswordReg to update them.
  const [usernameReg, setUsernameReg] = useState('')
  const [passwordReg, setPasswordReg] = useState('')
  // These 2 lines create state variables usernameLogin and passwordLogin, and functions setUsernameLogin and setPasswordLogin to update them.
  const [usernameLogin, setUsernameLogin] = useState('')
  const [passwordLogin, setPasswordLogin] = useState('')
  // This line creates a state variable loginStatus and a function setLoginStatus to update it.
  const [loginStatus, setLoginStatus] = useState('')

  // Register function sends POST request to server to register user.
  const register = () => {
    Axios.post('http://localhost:3001/register', {
      username: usernameReg,
      password: passwordReg
    }).then((response) => {
      // This line logs the response from the server to the console.
      console.log(response.data);
      // This line clears the username and password fields in the form after the user is successfully registered.
      setUsernameReg('');
      setPasswordReg('');
    });
  }

  // Login function sends POST request to server to log user in.
  const login = () => {
    Axios.post('http://localhost:3001/login', {
      username: usernameLogin,
      password: passwordLogin
    }).then((response) => {
      // This line logs the response from the server to the console which is plain script.
      setLoginStatus(response.data);
    }).catch((error) => {
      // Handling error
      if (error.response) {
        setLoginStatus(error.response.data);
      } else {
        setLoginStatus('An error occurred');
      }
  });
};
  // This block of code contains the JSX for the registration form.
  return (
    <div className="App">
      {/* This div contains the registration form. */}
      <div className="Registration">
        <h1>Registration</h1>

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
        </div>

      {/* This div contains the login form. */}
      <div className="Login">
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
        
      </div>

      {/* This div displays the login status message. */}
      <h1>{loginStatus}</h1>
    </div>
  );
}

export default App;
