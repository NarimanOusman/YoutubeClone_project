// Home.jsx
import React from "react";
import "./Home.css";
import Feed from "../../Components/feed/feed";

const Home = ({ category, searchQuery, savedVideos }) => {
  return (
    <div className="home-feed">
      <Feed category={category} searchQuery={searchQuery} savedVideos={savedVideos} />
    </div>
  );
};

export default Home;
