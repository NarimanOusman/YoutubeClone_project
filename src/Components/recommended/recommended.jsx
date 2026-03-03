// Recommended.jsx
import React, { useState, useEffect } from "react";
import "./recommended.css";
import { API_KEY } from "../../data";
import { Link } from "react-router-dom";

const Recommended = ({ categoryId }) => {
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // ✅ Fixed URL: removed HTTP/1.1, added proper encoding
      const relatedVideo_url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&videoCategoryId=${categoryId}&key=${API_KEY}&maxResults=12`;

      const response = await fetch(relatedVideo_url);
      const data = await response.json();

      if (data.items) {
        setApiData(data.items);
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
  }, [categoryId]);

  if (loading) {
    return <div className="recommended">Loading recommended videos...</div>;
  }

  return (
    <div className="recommended">
      {apiData.length === 0 ? (
        <p>No videos found</p>
      ) : (
        apiData.map((item) => (
          <Link
            to={`/video/${item.snippet.categoryId}/${item.id}`}
            className="side-video-list"
            key={item.id}
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
        ))
      )}
    </div>
  );
};

export default Recommended;
