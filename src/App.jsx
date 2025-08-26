// App.jsx
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Sidebar from "./Components/sidebar/sidebar"; // ✅
import Home from "./Pages/Home/Home";
import Video from "./Pages/Video/Video";

const App = () => {
  const [sidebar, setSidebar] = useState(true);
  const [category, setCategory] = useState("0");
  return (
    <>
      <Navbar setSidebar={setSidebar} category setCategory={setCategory} />

      {/* ✅ Sidebar is rendered globally */}
      <Sidebar sidebar={sidebar} />

      {/* Only the main content changes */}
      <div className={`container ${!sidebar ? "large-container" : ""}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/video/:categoryId/:videoId" element={<Video />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
