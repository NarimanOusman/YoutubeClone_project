import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './ProfileAvatar.css';

const ProfileAvatar = ({ session }) => {
  const [profile, setProfile] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleEditProfile = () => {
    navigate('/profile');
    setDropdownOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return session?.user?.email?.charAt(0).toUpperCase() || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!session) return null;

  return (
    <div className="profile-avatar-container" ref={dropdownRef}>
      <button 
        className="profile-avatar-button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {profile?.avatar_url ? (
          <img 
            src={profile.avatar_url} 
            alt="Profile" 
            className="profile-avatar-image"
          />
        ) : (
          <div className="profile-avatar-placeholder">
            {getInitials(profile?.full_name)}
          </div>
        )}
      </button>

      {dropdownOpen && (
        <div className="profile-dropdown">
          <div className="profile-dropdown-header">
            <div className="profile-info">
              <div className="profile-name">
                {profile?.full_name || 'User'}
              </div>
              <div className="profile-email">
                {session.user.email}
              </div>
            </div>
          </div>
          
          <div className="profile-dropdown-divider"></div>
          
          <div className="profile-dropdown-menu">
            <button 
              className="dropdown-item"
              onClick={handleEditProfile}
            >
              <span className="dropdown-icon">👤</span>
              Edit Profile
            </button>
            
            <div className="dropdown-divider"></div>
            
            <button 
              className="dropdown-item logout-item"
              onClick={handleSignOut}
            >
              <span className="dropdown-icon">🚪</span>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;
