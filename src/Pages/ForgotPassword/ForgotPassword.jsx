import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import emailjs from '@emailjs/browser';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const code = generateCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const { error: dbError } = await supabase
        .from('password_resets')
        .insert([
          {
            email: trimmedEmail,
            code,
            expires_at: expiresAt.toISOString(),
            used: false,
          },
        ]);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      const emailResult = await emailjs.send(
        'service_h8i77xa',
        'template_ms3ui0g',
        {
          to_email: trimmedEmail,
          to: trimmedEmail,
          email: trimmedEmail,
          user_email: trimmedEmail,
          recipient: trimmedEmail,
          reply_to: trimmedEmail,
          code,
        },
        {
          publicKey: 'gZ6Uw9Gtb0wqPO85I',
        }
      );

      if (emailResult?.status !== 200) {
        throw new Error('Email provider returned a non-success response.');
      }

      localStorage.setItem('resetEmail', trimmedEmail);

      setMessage('6-digit code sent. Check your email.');
      setMessageType('success');

      setTimeout(() => {
        navigate('/verify-code');
      }, 900);

    } catch (error) {
      const providerHint = error?.text ? ` EmailJS: ${error.text}` : '';
      const statusHint = error?.status ? ` (status ${error.status})` : '';
      const details = error?.message || 'Failed to send reset code';
      const recipientHint =
        error?.status === 422
          ? ' Configure EmailJS template To Email as {{to_email}} (or {{email}}) in dashboard.'
          : '';
      setMessage(`${details}${statusHint}${providerHint}${recipientHint}`);
      console.error('Forgot password send code error:', error);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Forgot Password</h2>
        <p>Enter your email address and we'll send you a 6-digit verification code.</p>

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
