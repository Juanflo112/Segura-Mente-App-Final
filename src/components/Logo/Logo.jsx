import React from 'react';
import './Logo.css';
import logoImage from '../../assets/images/logo.png';

const Logo = () => {
  return (
    <div className="logo-container">
      <img src={logoImage} alt="Segura-Mente Logo" className="logo-image" />
    </div>
  );
};

export default Logo;