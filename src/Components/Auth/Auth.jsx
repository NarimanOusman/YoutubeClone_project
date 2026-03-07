import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        type: '',
        message: ''
    });
    const navigate = useNavigate();

    // Password strength
    const getPasswordStrength = (pwd) => {
        if (!pwd) return { level: 0, label: '', color: '' };
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 10) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        if (score <= 1) return { level: 1, label: 'Weak', color: '#ef4444' };
        if (score === 2) return { level: 2, label: 'Fair', color: '#f97316' };
        if (score === 3) return { level: 3, label: 'Strong', color: '#22c55e' };
        return { level: 4, label: 'Very Strong', color: '#16a34a' };
    };

    // Post form state
    const [videoTitle, setVideoTitle] = useState('');
    const [videoDesc, setVideoDesc] = useState('');
    const [videoUrl, setVideoUrl] = useState('');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Show notification function
    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => {
            setNotification({ show: false, type: '', message: '' });
        }, 3000);
    };

    // Handle avatar file selection
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Upload avatar to Supabase Storage
    const uploadAvatar = async (userId, file) => {
        if (!file) return null;
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
            });
            
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
            
        return data.publicUrl;
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });

            showNotification('success', 'Account created!');
            setActiveTab('login');
            setEmail('');
            setPassword('');
            setFullName('');
            setAvatarFile(null);
            setAvatarPreview('');
            
        } catch (error) {
            showNotification('error', 'Signup failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    showNotification('error', 'Invalid email or password. Please try again.');
                } else if (error.message.includes('Email not confirmed')) {
                    showNotification('error', 'Please confirm your email before signing in.');
                } else {
                    showNotification('error', error.message);
                }
                return;
            }
            
            // Redirect to home page after successful login
            navigate('/');
            
        } catch (error) {
            showNotification('error', 'An error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!videoTitle || !videoUrl) return alert("Title and Video URL are required!");
        setLoading(true);

        const { error } = await supabase
            .from('videos')
            .insert([{
                title: videoTitle,
                description: videoDesc,
                video_url: videoUrl,
                user_id: session.user.id,
            }]);

        setLoading(false);
        if (error) {
            alert("Error posting video: " + error.message);
        } else {
            alert("Video posted successfully! 🎉");
            setVideoTitle('');
            setVideoDesc('');
            setVideoUrl('');
        }
    };

    // ─── LOGGED IN: Show Post Video form ───────────────────────────────
    if (session) {
        return (
            <div className="post-page">
                <div className="post-header">
                    <div className="post-header-info">
                        <h2>My Account</h2>
                        <p>{session.user.email}</p>
                    </div>
                    <button className="btn-logout" onClick={handleLogout}>Log Out</button>
                </div>

                <div className="post-card">
                    <h3>📹 Post a New Video</h3>
                    <form onSubmit={handleCreatePost} className="auth-form">
                        <div className="form-group">
                            <label>Video Title *</label>
                            <input
                                type="text"
                                placeholder="Enter a descriptive title"
                                value={videoTitle}
                                onChange={(e) => setVideoTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                placeholder="What is this video about?"
                                value={videoDesc}
                                onChange={(e) => setVideoDesc(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>YouTube Video URL *</label>
                            <input
                                type="url"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="auth-btn-primary" disabled={loading}>
                            {loading ? "Posting..." : "Post Video"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ─── LOGGED OUT: Show Login / Sign Up form ──────────────────────────
    return (
        <div className="auth-page">
            {/* Notification Toast */}
            {notification.show && (
                <div className={`notification-toast ${notification.type}`}>
                    <div className="notification-content">
                        <span className="notification-icon">
                            {notification.type === 'success' ? '✓' : '⚠'}
                        </span>
                        <span className="notification-message">
                            {notification.message}
                        </span>
                    </div>
                </div>
            )}

            <div className="auth-card">

                {/* Logo */}
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                        </svg>
                    </div>
                    <span className="auth-logo-text">Vid<span>Tube</span></span>
                </div>

                <p className="auth-subtitle">Sign in to your account to post and manage videos</p>

                {/* Tabs */}
                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                        onClick={() => setActiveTab('login')}
                    >
                        Sign In
                    </button>
                    <button
                        className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
                        onClick={() => setActiveTab('signup')}
                    >
                        Create Account
                    </button>
                </div>

                {/* Login Form */}
                {activeTab === 'login' && (
                    <form onSubmit={handleLogin} className="auth-form">
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="auth-btn-primary" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                        
                        <div className="forgot-password-link">
                            <a href="/forgot-password">Forgot your password?</a>
                        </div>
                    </form>
                )}

                {/* Sign Up Form */}
                {activeTab === 'signup' && (
                    <form onSubmit={handleSignUp} className="auth-form">
                        <div className="signup-form-left">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Profile Picture (Optional)</label>
                                <div className="avatar-upload">
                                    {avatarPreview ? (
                                        <div className="avatar-preview">
                                            <img src={avatarPreview} alt="Avatar preview" />
                                            <button 
                                                type="button" 
                                                className="remove-avatar"
                                                onClick={() => {
                                                    setAvatarPreview('');
                                                    setAvatarFile(null);
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="avatar-placeholder">
                                            <div className="avatar-icon">👤</div>
                                            <span>Add Photo</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="avatar-input"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="signup-form-right">
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    placeholder="Minimum 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            
                            {password.length > 0 && (() => {
                                const strength = getPasswordStrength(password);
                                return (
                                    <div className="strength-wrapper">
                                        <div className="strength-bar-track">
                                            <div
                                                className="strength-bar-fill"
                                                style={{
                                                    width: `${(strength.level / 4) * 100}%`,
                                                    background: strength.color
                                                }}
                                            />
                                        </div>
                                        <span className="strength-label" style={{ color: strength.color }}>
                                            {strength.label}
                                        </span>
                                    </div>
                                );
                            })()}
                            
                            <button type="submit" className="auth-btn-primary" disabled={loading}>
                                {loading ? "Creating account..." : "Create Account"}
                            </button>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
};

export default Auth;
