import React from "react";
import { useParams } from "react-router-dom";
import "./Video.css";
import PlayVideo from "../../Components/playvideo/playvideo";

// Video.jsx
const Video = ({ sidebar }) => {
  const { videoId } = useParams();

  return (
    <div className="played-container">
      <PlayVideo sidebar={sidebar} videoId={videoId} />
    </div>
  );
};

export default Video;
