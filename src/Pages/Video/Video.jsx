import React from "react";
import "./Video.css";
import PlayVideo from "../../Components/playvideo/playvideo";

// Video.jsx
const Video = ({ sidebar }) => {
  return (
    <div className="played-container">
      <PlayVideo sidebar={sidebar} />
    </div>
  );
};

export default Video;
