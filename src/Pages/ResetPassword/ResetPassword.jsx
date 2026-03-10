import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword = () => {
  const navigate = useNavigate();

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Password Reset Disabled</h2>
        <p>The reset password form has been removed from this project.</p>
        <button className="reset-btn" type="button" onClick={() => navigate('/')}>
          Go Home
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
