import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import emailjs from '@emailjs/browser';
import './ForgotPassword.css';

const ForgotPassword = () => {
  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Password Reset Disabled</h2>
        <p>The forgot password form has been removed from this project.</p>
        <a href="/">Go Home</a>
      </div>
    </div>
  );
};

export default ForgotPassword;
