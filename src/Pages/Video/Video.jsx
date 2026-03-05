import React from "react";
import { useParams } from "react-router-dom";
import "./Video.css";
import PlayVideo from "../../Components/playvideo/playvideo";

// Video.jsx
const Video = ({ sidebar, category, savedVideos, setSavedVideos, subscribedChannels, setSubscribedChannels }) => {
  const { videoId, categoryId } = useParams();

  return (
    <div className="played-container">
      <PlayVideo
        sidebar={sidebar}
        videoId={videoId}
        categoryId={category !== "0" ? category : categoryId}
        savedVideos={savedVideos}
        setSavedVideos={setSavedVideos}
        subscribedChannels={subscribedChannels}
        setSubscribedChannels={setSubscribedChannels}
      />
    </div>
  );
};

export default Video;
