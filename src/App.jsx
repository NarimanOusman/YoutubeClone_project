// App.jsx
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Sidebar from "./Components/sidebar/sidebar";
import Home from "./Pages/Home/Home";
import Video from "./Pages/Video/Video";

const App = () => {
  const [sidebar, setSidebar] = useState(true);
  const [category, setCategory] = useState("0");
  const [searchQuery, setSearchQuery] = useState("");

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
      <div className={`container ${!sidebar ? "large-container" : ""}`}>
        <Routes>
          <Route path="/" element={<Home category={category} searchQuery={searchQuery} />} />
          <Route path="/video/:categoryId/:videoId" element={<Video />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
