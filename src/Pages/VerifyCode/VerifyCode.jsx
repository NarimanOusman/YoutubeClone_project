import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './VerifyCode.css';

const VerifyCode = () => {
  const navigate = useNavigate();

  return (
    <div className="verify-code-container">
      <div className="verify-code-card">
        <h2>Verification Disabled</h2>
        <p>The verify code form has been removed from this project.</p>
        <button className="verify-btn" type="button" onClick={() => navigate('/')}>
          Go Home
        </button>
      </div>
    </div>
  );
};

export default VerifyCode;
