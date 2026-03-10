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
      setMessage('No verified email found. Please start the password reset process again.');
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

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;

    const strengthLevels = {
      0: { text: 'Very Weak', color: '#ff4757' },
      1: { text: 'Weak', color: '#ff6348' },
      2: { text: 'Fair', color: '#ffa502' },
      3: { text: 'Good', color: '#ffdd59' },
      4: { text: 'Strong', color: '#26de81' },
      5: { text: 'Very Strong', color: '#20bf6b' }
    };

    return {
      score,
      ...strengthLevels[score],
      checks
    };
  };

  const passwordStrength = calculatePasswordStrength(password);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (passwordStrength.score < 3) {
      setMessage('Password is too weak. Please choose a stronger password.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
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
                    width: `${(passwordStrength.score / 5) * 100}%`,
                    backgroundColor: passwordStrength.color
                  }}
                />
              </div>
              <div className="strength-requirements">
                <div className={`requirement ${passwordStrength.checks.length ? 'met' : ''}`}>
                  ✓ At least 8 characters
                </div>
                <div className={`requirement ${passwordStrength.checks.lowercase ? 'met' : ''}`}>
                  ✓ One lowercase letter
                </div>
                <div className={`requirement ${passwordStrength.checks.uppercase ? 'met' : ''}`}>
                  ✓ One uppercase letter
                </div>
                <div className={`requirement ${passwordStrength.checks.numbers ? 'met' : ''}`}>
                  ✓ One number
                </div>
                <div className={`requirement ${passwordStrength.checks.special ? 'met' : ''}`}>
                  ✓ One special character
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
