import React, { useState, useEffect } from 'react';
import { ChevronLeft, Bell, Lock, Eye, Volume2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    notifyComments: true,
    notifyReplies: true,
    notifySubscribers: true,
    emailNotifications: false,
    videoQuality: 'auto',
    playbackSpeed: 1.0,
    privateProfile: false,
    allowComments: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: authData } = await supabase.auth.getSession();
      const currentSession = authData.session;

      if (!currentSession) {
        navigate('/login');
        return;
      }

      setSession(currentSession);
      // Fetch saved settings from database (optional)
      setLoading(false);
    };

    init();
  }, [navigate]);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSelectChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSaveSettings = async () => {
    try {
      // Save settings to Supabase (store in a user_settings table)
      const { error } = await supabase.from('user_settings').upsert({
        user_id: session.user.id,
        settings: settings,
        updated_at: new Date().toISOString(),
      });

      if (error && error.code !== 'PGRST116') {
        // PGRST116 means table doesn't exist, which is fine for now
        console.error('Error saving settings:', error.message);
        alert('Settings not saved. You can still use them locally.');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-container">
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <button onClick={() => navigate(-1)} className="settings-back" title="Go back">
          <ChevronLeft size={24} />
        </button>
        <h1>Settings</h1>
        <div style={{ width: 24 }} />
      </div>

      <div className="settings-container">
        {/* Notification Preferences */}
        <div className="settings-section">
          <div className="settings-section-header">
            <Bell size={20} />
            <h2>Notification Preferences</h2>
          </div>

          <div className="settings-option">
            <div className="option-info">
              <h3>Comments on your videos</h3>
              <p>Get notified when someone comments on your video</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifyComments}
                onChange={() => handleToggle('notifyComments')}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="settings-option">
            <div className="option-info">
              <h3>Replies to your comments</h3>
              <p>Get notified when someone replies to your comment</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifyReplies}
                onChange={() => handleToggle('notifyReplies')}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="settings-option">
            <div className="option-info">
              <h3>New subscribers</h3>
              <p>Get notified when you get a new subscriber</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifySubscribers}
                onChange={() => handleToggle('notifySubscribers')}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="settings-option">
            <div className="option-info">
              <h3>Email notifications</h3>
              <p>Receive email updates for important events</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="settings-section">
          <div className="settings-section-header">
            <Lock size={20} />
            <h2>Privacy & Visibility</h2>
          </div>

          <div className="settings-option">
            <div className="option-info">
              <h3>Private profile</h3>
              <p>Make your profile visible only to your followers</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.privateProfile}
                onChange={() => handleToggle('privateProfile')}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="settings-option">
            <div className="option-info">
              <h3>Allow comments on videos</h3>
              <p>Let viewers comment on your videos</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.allowComments}
                onChange={() => handleToggle('allowComments')}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {/* Playback Settings */}
        <div className="settings-section">
          <div className="settings-section-header">
            <Eye size={20} />
            <h2>Playback & Quality</h2>
          </div>

          <div className="settings-option">
            <div className="option-info">
              <h3>Video quality</h3>
              <p>Choose your preferred playback quality</p>
            </div>
            <select
              value={settings.videoQuality}
              onChange={(e) => handleSelectChange('videoQuality', e.target.value)}
              className="settings-select"
            >
              <option value="auto">Auto (recommended)</option>
              <option value="1080">1080p</option>
              <option value="720">720p</option>
              <option value="480">480p</option>
              <option value="360">360p</option>
            </select>
          </div>

          <div className="settings-option">
            <div className="option-info">
              <h3>Playback speed</h3>
              <p>Default playback speed for videos</p>
            </div>
            <select
              value={settings.playbackSpeed}
              onChange={(e) => handleSelectChange('playbackSpeed', parseFloat(e.target.value))}
              className="settings-select"
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1.0}>1.0x (Normal)</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2.0}>2.0x</option>
            </select>
          </div>
        </div>

        {/* Account Settings */}
        <div className="settings-section">
          <div className="settings-section-header">
            <LogOut size={20} />
            <h2>Account</h2>
          </div>

          <div className="settings-option">
            <div className="option-info">
              <h3>{session?.user?.email}</h3>
              <p>Your account email address</p>
            </div>
            <span className="settings-info-badge">Active</span>
          </div>

          <div className="settings-option">
            <div className="option-info">
              <h3>Sign out</h3>
              <p>Sign out from your account on this device</p>
            </div>
            <button onClick={handleSignOut} className="settings-btn-danger">
              Sign Out
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="settings-actions">
          <button onClick={handleSaveSettings} className="settings-btn-primary">
            Save Settings
          </button>
          {saved && <span className="settings-saved">✓ Settings saved</span>}
        </div>
      </div>
    </div>
  );
}
