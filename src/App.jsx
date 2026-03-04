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
  const location = useLocation();

  const isVideoPage = location.pathname.startsWith("/video");

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
      {/* ✅ Navbar only needs setSidebar */}
      <Navbar setSidebar={setSidebar} sidebar={sidebar} setSearchQuery={setSearchQuery} />

      {/* ✅ Sidebar needs sidebar, category, and setCategory */}
      <Sidebar
        sidebar={sidebar}
        category={category}
        setCategory={setCategory}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content */}
      <div className={`container ${!sidebar ? "large-container" : ""} ${isVideoPage ? "video-page" : ""}`}>
        <Routes>
          <Route path="/" element={<Home category={category} searchQuery={searchQuery} />} />
          <Route path="/video/:categoryId/:videoId" element={<Video sidebar={sidebar} />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
