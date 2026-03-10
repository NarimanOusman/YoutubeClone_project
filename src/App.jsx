// App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Sidebar from "./Components/sidebar/sidebar";
import Home from "./Pages/Home/Home";
import Video from "./Pages/Video/Video";
import Auth from "./Components/Auth/Auth";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
import VerifyCode from "./Pages/VerifyCode/VerifyCode";
import ResetPassword from "./Pages/ResetPassword/ResetPassword";
import Profile from "./Pages/Profile/Profile";

const App = () => {
  const [sidebar, setSidebar] = useState(window.innerWidth > 900);
  const [category, setCategory] = useState("0");
  const [searchQuery, setSearchQuery] = useState("");

  // Persistence for Saved Videos
  const [savedVideos, setSavedVideos] = useState(() => {
    const saved = localStorage.getItem("savedVideos");
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence for Subscribed Channels
  const [subscribedChannels, setSubscribedChannels] = useState(() => {
    const subs = localStorage.getItem("subscribedChannels");
    return subs ? JSON.parse(subs) : [];
  });

  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/verify-code" ||
    location.pathname === "/reset-password";

  // Update localStorage when savedVideos changes
  useEffect(() => {
    localStorage.setItem("savedVideos", JSON.stringify(savedVideos));
  }, [savedVideos]);

  // Update localStorage when subscribedChannels changes
  useEffect(() => {
    localStorage.setItem("subscribedChannels", JSON.stringify(subscribedChannels));
  }, [subscribedChannels]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (window.innerWidth <= 900 && sidebar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [sidebar]);

  return (
    <>
      {!isAuthPage && (
        <>
          <Navbar setSidebar={setSidebar} sidebar={sidebar} setSearchQuery={setSearchQuery} />
          {sidebar && window.innerWidth <= 900 && (
            <div className="sidebar-overlay" onClick={() => setSidebar(false)}></div>
          )}
          <Sidebar
            sidebar={sidebar}
            category={category}
            setCategory={setCategory}
            setSearchQuery={setSearchQuery}
            subscribedChannels={subscribedChannels}
          />
        </>
      )}

      <Routes>
        {/* Auth pages — full screen, no navbar/sidebar */}
        <Route path="/login" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Profile page */}
        <Route path="/profile" element={<Profile />} />

        {/* Main app pages — wrapped in container */}
        <Route
          path="/"
          element={
            <div className={`container ${!sidebar ? "large-container" : ""}`}>
              <Home category={category} searchQuery={searchQuery} savedVideos={savedVideos} />
            </div>
          }
        />
        <Route
          path="/video/:categoryId/:videoId"
          element={
            <div className={`container large-container video-page`}>
              <Video
                sidebar={sidebar}
                category={category}
                savedVideos={savedVideos}
                setSavedVideos={setSavedVideos}
                subscribedChannels={subscribedChannels}
                setSubscribedChannels={setSubscribedChannels}
              />
            </div>
          }
        />
      </Routes>
    </>
  );
};

export default App;
