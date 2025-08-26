// Home.jsx
import React from "react";
import "./Home.css";
import Feed from "../../Components/feed/feed";

const Home = ({ category }) => {
  return (
    <div className="home-feed">
      <Feed category={category} />
    </div>
  );
};

export default Home;
