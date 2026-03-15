import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ProfileAvatar from '../../Components/ProfileAvatar/ProfileAvatar';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }
      setSession(session);
      fetchProfile(session);
    };

    getSession();
  }, [navigate]);

  const fetchProfile = async (session) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      const profileRow = data || {
        id: session.user.id,
        full_name: session.user.user_metadata?.full_name || '',
        avatar_url: null
      };

      setProfile(profileRow);
      setFullName(profileRow.full_name || '');
      setAvatarPreview(profileRow.avatar_url || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

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

  const uploadAvatar = async () => {
    if (!avatarFile) return null;

    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${session.user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, {
        cacheControl: '3600',
        contentType: avatarFile.type,
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return `${data.publicUrl}?t=${Date.now()}`;
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      let avatarUrl = profile?.avatar_url;
      
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;

      // Update auth user metadata
      await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      setEditing(false);
      setAvatarFile(null);
      fetchProfile(session);
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session || !profile) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Account</h1>
        <ProfileAvatar session={session} />
      </div>

      <div className="profile-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h2>Welcome, {profile.full_name || 'User'}! 👋</h2>
          <p>Manage your profile details and keep your account information up to date.</p>
        </div>

        {/* Profile Section */}
        <div className="profile-section">
          <h3>Profile Information</h3>
          <div className="profile-info-card">
            <div className="avatar-section">
              <div className="avatar-upload-container">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="avatar-preview-large" />
                ) : (
                  <div className="avatar-placeholder-large">
                    <span>👤</span>
                  </div>
                )}
                {editing && (
                  <div className="avatar-upload-overlay">
                    <label htmlFor="avatar-upload" className="upload-btn">
                      📷 Change Photo
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden-input"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="profile-details">
              <div className="form-group">
                <label>Full Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="profile-input"
                  />
                ) : (
                  <p>{profile.full_name || 'Not set'}</p>
                )}
              </div>

              <div className="form-group">
                <label>Email</label>
                <p>{session.user.email}</p>
              </div>

              <div className="profile-actions">
                {editing ? (
                  <div className="edit-actions">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="save-btn"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setAvatarFile(null);
                        setAvatarPreview(profile.avatar_url || '');
                        setFullName(profile.full_name || '');
                      }}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="default-actions">
                    <button
                      onClick={() => navigate('/my-posts')}
                      className="account-btn"
                    >
                      Account
                    </button>
                    <button
                      onClick={() => setEditing(true)}
                      className="edit-btn"
                    >
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
