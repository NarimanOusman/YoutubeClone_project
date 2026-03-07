import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import emailjs from '@emailjs/browser';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Generate 6-digit code
      const code = generateCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      const formattedCode = `Nariman_Vid${code}`;

      // Save to Supabase password_resets table
      const { error: dbError } = await supabase
        .from('password_resets')
        .insert([
          {
            email: email,
            code: code,
            expires_at: expiresAt.toISOString(),
            used: false
          }
        ]);

      if (dbError) {
        throw new Error('Failed to save reset code');
      }

      // Send email using EmailJS
      const templateParams = {
        to_email: email,
        code: formattedCode
      };

      await emailjs.send(
        'service_h8i77xa', // Your EmailJS service ID
        'template_ms3ui0g', // Your EmailJS template ID
        templateParams,
        'gZ6Uw9Gtb0wqPO85I'   // Your EmailJS public key
      );

      // Save email to localStorage for next step
      localStorage.setItem('resetEmail', email);

      setMessage('Reset code sent to your email! Check your inbox.');
      setMessageType('success');
      
    } catch (error) {
      setMessage(error.message || 'Failed to send reset code');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Forgot Password</h2>
        <p>Enter your email address and we'll send you a verification code.</p>
        
        <form onSubmit={handleSendCode} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <button 
            type="submit" 
            className="send-code-btn"
            disabled={loading || !email}
          >
            {loading ? 'Sending...' : 'Send Code'}
          </button>
        </form>
        
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}
        
        <div className="back-to-login">
          <a href="/login">Back to Login</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
