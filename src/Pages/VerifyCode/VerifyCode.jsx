import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './VerifyCode.css';

const VerifyCode = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {
    // Get email from localStorage or URL params
    const savedEmail = localStorage.getItem('resetEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      setMessage('No email found. Please start the password reset process again.');
      setMessageType('error');
    }
  }, []);

  const handleInputChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const numbers = pastedData.replace(/\D/g, '').slice(0, 6);
    
    const newCode = ['', '', '', '', '', ''];
    for (let i = 0; i < numbers.length; i++) {
      newCode[i] = numbers[i];
    }
    setCode(newCode);
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = numbers.length < 6 ? numbers.length : 5;
    setTimeout(() => {
      inputRefs.current[nextEmptyIndex].focus();
    }, 0);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      setMessage('Please enter all 6 digits');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      // Check code in Supabase
      const { data, error } = await supabase
        .from('password_resets')
        .select('*')
        .eq('email', email)
        .eq('code', fullCode)
        .eq('used', false)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        setMessage('Invalid or expired code');
        setMessageType('error');
        return;
      }

      // Mark code as used
      await supabase
        .from('password_resets')
        .update({ used: true })
        .eq('id', data.id);

      // Store verification info and redirect to reset password
      localStorage.setItem('verifiedEmail', email);
      localStorage.setItem('resetId', data.id);
      
      setMessage('Code verified! Redirecting...');
      setMessageType('success');
      
      setTimeout(() => {
        navigate('/reset-password');
      }, 1500);
      
    } catch (error) {
      setMessage('Failed to verify code');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // Navigate back to forgot password to resend
    localStorage.setItem('resetEmail', email);
    navigate('/forgot-password');
  };

  return (
    <div className="verify-code-container">
      <div className="verify-code-card">
        <h2>Verify Code</h2>
        <p>Enter the 6-digit code sent to {email}</p>
        
        <form onSubmit={handleVerify} className="verify-code-form">
          <div className="code-inputs">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="code-input"
                disabled={loading}
              />
            ))}
          </div>
          
          <button 
            type="submit" 
            className="verify-btn"
            disabled={loading || code.join('').length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
        
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}
        
        <div className="resend-section">
          <p>Didn't receive the code?</p>
          <button 
            type="button" 
            className="resend-btn"
            onClick={handleResend}
          >
            Resend Code
          </button>
        </div>
        
        <div className="back-to-login">
          <a href="/login">Back to Login</a>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
