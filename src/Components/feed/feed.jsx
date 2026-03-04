import React, { useEffect, useState } from "react";
import "./feed.css";

import { Link } from "react-router-dom";
import value_convertor, { API_KEY } from "../../data";
import moment from "moment";

const feed = ({ category, searchQuery, savedVideos }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    // If viewing saved videos, bypass API call
    if (category === "saved") {
      setData(savedVideos || []);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (!API_KEY) {
      console.error("YouTube API Key is missing! Please set VITE_YOUTUBE_API_KEY in your .env file (local) or Render dashboard (live).");
      setLoading(false);
      return;
    }

    let url = "";

    if (searchQuery) {
      url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=${searchQuery}&type=video&key=${API_KEY}`;
    } else {
      url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&maxResults=50&regionCode=US&videoCategoryId=${category}&key=${API_KEY}`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();
      setData(data.items || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category, searchQuery, savedVideos]); // Refresh if savedVideos changes while on that tab

  return (
    <div className="feed">
      {loading ? (
        <div className="loading-state">
          <h2>Loading videos...</h2>
        </div>
      ) : data.length === 0 ? (
        <div className="no-videos">
          <h2>{category === "saved" ? "You haven't saved any videos yet." : "No videos found."}</h2>
          {category !== "saved" && !API_KEY && <p style={{ color: 'red' }}>Error: YouTube API Key is missing.</p>}
        </div>
      ) : (
        data.map((item, index) => {
          const videoId = typeof item.id === "string" ? item.id : item.id.videoId;
          const categoryId = item.snippet.categoryId || "0";
          const viewCount = item.statistics ? value_convertor(item.statistics.viewCount) : "---";

          return (
            <Link
              to={`/video/${categoryId}/${videoId}`}
              className="card-link"
              key={index}
            >
              <div className="card">
                <img
                  src={item.snippet.thumbnails.medium.url}
                  alt={item.snippet.title}
                />
                <h2>{item.snippet.title}</h2>
                <p1>{item.snippet.channelTitle}</p1>
                <p>
                  {viewCount} views &bull;{" "}
                  {moment(item.snippet.publishedAt).fromNow()}
                </p>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
};

export default feed;
