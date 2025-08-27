import React, { useEffect, useState } from "react";
import "./feed.css";

import { Link } from "react-router-dom";
import value_convertor, { API_KEY } from "../../data";
import moment from "moment";

const feed = ({ category }) => {
  const [data, setData] = useState([]);
  const fetchData = async () => {
    const videoList = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&maxResults=50&regionCode=US&videoCategoryId=${category}&key=${API_KEY}`;
    await fetch(videoList)
      .then((Response) => Response.json())
      .then((data) => setData(data.items));
  };
  useEffect(() => {
    fetchData();
  }, [category]);
  return (
    <div className="feed">
      {data.map((item, index) => {
        return (
          <Link
            to={`/Video/${item.snippet.categoryId}/${item.id}`}
            className="card-link"
            key={index}
          >
            <div className="card">
              <img
                src={item.snippet.thumbnails.medium.url}
                alt="Best channel to learn coding"
              />
              <h2>{item.snippet.title}</h2>
              <p1>{item.snippet.channelTitle}</p1>
              <p>
                {value_convertor(item.statistics.viewCount)} views &bull;{" "}
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
