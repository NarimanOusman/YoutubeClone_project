import React, { useEffect, useState } from "react";
import "./feed.css";

import { Link } from "react-router-dom";
import value_convertor, { API_KEY } from "../../data";
import moment from "moment";

const feed = ({ category, searchQuery }) => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    let url = "";

    if (searchQuery) {
      // If there's a search query, use the search API
      url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=${searchQuery}&type=video&key=${API_KEY}`;
    } else {
      // Otherwise, show popular videos for the selected category
      url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&maxResults=50&regionCode=US&videoCategoryId=${category}&key=${API_KEY}`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();

      // The search API returns results in 'items' too, but slightly different snippet structure
      // For statistics on search items, we might need a separate call, 
      // but let's keep it simple first to see if results show up.
      setData(data.items || []);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category, searchQuery]);
  return (
    <div className="feed">
      {data.map((item, index) => {
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
      })}
    </div>
  );
};

export default feed;
