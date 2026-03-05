// App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Sidebar from "./Components/sidebar/sidebar";
import Home from "./Pages/Home/Home";
import Video from "./Pages/Video/Video";

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
  const isVideoPage = location.pathname.startsWith("/video");

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
      <Navbar setSidebar={setSidebar} sidebar={sidebar} setSearchQuery={setSearchQuery} />
      {/* Backdrop for mobile sidebar */}
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

      <div className={`container ${!sidebar ? "large-container" : ""} ${isVideoPage ? "video-page" : ""}`}>
        <Routes>
          <Route path="/" element={<Home category={category} searchQuery={searchQuery} savedVideos={savedVideos} />} />
          <Route path="/video/:categoryId/:videoId" element={<Video sidebar={sidebar} category={category} savedVideos={savedVideos} setSavedVideos={setSavedVideos} subscribedChannels={subscribedChannels} setSubscribedChannels={setSubscribedChannels} />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
