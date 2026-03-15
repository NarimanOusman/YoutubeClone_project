// Recommended.jsx
import React, { useState, useEffect } from "react";
import "./recommended.css";
import { API_KEY } from "../../data";
import { Link } from "react-router-dom";

const Recommended = ({ categoryId, setQueue, savedVideos }) => {
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getYoutubeVideoId = (item) => {
    if (!item) return null;
    if (typeof item.id === "string") return item.id;
    if (typeof item.id?.videoId === "string") return item.id.videoId;
    if (typeof item.snippet?.resourceId?.videoId === "string") return item.snippet.resourceId.videoId;
    return null;
  };

  const fetchData = async () => {
    if (categoryId === "saved") {
      setApiData(savedVideos || []);
      if (setQueue) setQueue(savedVideos || []);
      setLoading(false);
      return;
    }

    try {
      const relatedVideo_url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&videoCategoryId=${categoryId}&key=${API_KEY}&maxResults=15`;
      const response = await fetch(relatedVideo_url);
      const data = await response.json();

      if (data.items) {
        setApiData(data.items);
        if (setQueue) setQueue(data.items);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching recommended videos:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchData();
    }
  }, [categoryId, savedVideos]);

  if (loading) {
    return <div className="recommended">Loading recommended videos...</div>;
  }

  return (
    <div className="recommended">
      {apiData.length === 0 ? (
        <p>No videos found</p>
      ) : (
        apiData.map((item) => {
          const videoId = getYoutubeVideoId(item);
          if (!videoId) return null;

          return (
          <Link
            to={`/video/${item.snippet?.categoryId || "0"}/${videoId}`}
            className="side-video-list"
            key={videoId}
          >
            <img
              src={item.snippet.thumbnails.medium.url}
              alt={item.snippet.title}
              width="160"
              height="90"
            />
            <div className="vid-info">
              <h4>{item.snippet.title}</h4>
              <p>{item.snippet.channelTitle}</p>
              <p>
                {item.statistics?.viewCount
                  ? `${Math.round(item.statistics.viewCount / 1000)}K views`
                  : "New"}{" "}
                &bull; 2 days ago
              </p>
            </div>
          </Link>
          );
        })
      )}
    </div>
  );
};

export default Recommended;
