import React from 'react';
import './Login.css';
import Logo from '../Logo/Logo';
import LoginForm from './LoginForm';
import loginImage from '../../assets/images/login-image.jpg';

const Login = () => {
  return (
    <div className="login-container">
      {/* Patrón decorativo de fondo */}
      <div className="background-pattern"></div>
      
      <div className="login-content">
        <div className="login-left">
          <div className="logo-wrapper">
            <Logo />
          </div>
          <LoginForm />
        </div>
        
        <div className="login-right">
          <div className="image-wrapper">
            <img 
              src={loginImage} 
              alt="Persona trabajando" 
              className="login-image" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;