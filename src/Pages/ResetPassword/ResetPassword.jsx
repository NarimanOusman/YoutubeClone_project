import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifiedEmail = localStorage.getItem('verifiedEmail');
    if (!verifiedEmail) {
      setMessage('No verified email found. Please verify the 6-digit code first.');
      setMessageType('error');
      setTimeout(() => {
        navigate('/forgot-password');
      }, 2000);
    } else {
      setEmail(verifiedEmail);
    }
  }, [navigate]);

  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, text: '', color: '#ddd' };

    let score = 1;
    if (password.length >= 8) score = 2;
    if (password.length >= 10) score = 3;
    if (password.length >= 12) score = 4;

    const strengthLevels = {
      0: { text: 'Very Weak', color: '#ff4757' },
      1: { text: 'Weak', color: '#ff6348' },
      2: { text: 'Okay', color: '#ffa502' },
      3: { text: 'Good', color: '#22c55e' },
      4: { text: 'Strong', color: '#16a34a' }
    };

    return {
      score,
      ...strengthLevels[score]
    };
  };

  const passwordStrength = calculatePasswordStrength(password);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const resetId = localStorage.getItem('resetId');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      // Primary flow: custom 6-digit verification + server-side RPC password update
      let finalError = null;

      if (resetId && email) {
        const { error: rpcError } = await supabase.rpc('reset_password_with_code_v1', {
          p_email: email,
          p_reset_id: resetId,
          p_new_password: password,
        });

        if (rpcError) {
          const v1Missing =
            rpcError?.code === 'PGRST202' ||
            String(rpcError?.message || '').includes('Could not find the function public.reset_password_with_code_v1');

          if (v1Missing) {
            throw new Error('Setup required: reset_password_with_code_v1 is missing. Run the latest create-password-resets.sql and retry.');
          }

          finalError = rpcError;
        }
      } else {
        finalError = new Error('Missing reset session. Please verify your code again.');
      }

      // Fallback flow: if user came from Supabase recovery email link
      if (finalError) {
        const { error: sessionError } = await supabase.auth.updateUser({ password });
        if (sessionError) {
          throw finalError;
        }
      }

      localStorage.removeItem('resetEmail');
      localStorage.removeItem('verifiedEmail');
      localStorage.removeItem('resetId');

      setMessage('Password reset successfully! Redirecting to login...');
      setMessageType('success');

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Reset password failed:', error);
      setMessage(error.message || 'Failed to reset password');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Reset Password</h2>
        <p>Create a new password for {email}</p>

        <form onSubmit={handleResetPassword} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter new password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
            />
          </div>

          {password && (
            <div className="password-strength">
              <div className="strength-header">
                <span>Password Strength</span>
                <span className="strength-text" style={{ color: passwordStrength.color }}>
                  {passwordStrength.text}
                </span>
              </div>
              <div className="strength-bar">
                <div
                  className="strength-fill"
                  style={{
                    width: `${(passwordStrength.score / 4) * 100}%`,
                    backgroundColor: passwordStrength.color
                  }}
                />
              </div>
              <div className="strength-requirements">
                <div className={`requirement ${password.length >= 6 ? 'met' : ''}`}>
                  ✓ At least 6 characters
                </div>
                <div className="requirement requirement-note">
                  Tip: Use a longer password for better security
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="reset-btn"
            disabled={loading || !password || !confirmPassword}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
