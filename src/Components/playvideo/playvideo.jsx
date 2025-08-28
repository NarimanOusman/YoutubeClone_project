// PlayVideo.jsx
import React, { useState, useEffect } from "react";
import "./playvideo.css";
import like from "../../assets/like.png";
import dislike from "../../assets/dislike.png";
import share from "../../assets/share.png";
import save from "../../assets/save.png";
import jack from "../../assets/jack.png";
import user_profile from "../../assets/user_profile.jpg";
import Recommended from "../../Components/recommended/recommended";
import value_convertor, { API_KEY } from "../../data";
import moment from "moment";

const PlayVideo = ({ sidebar, videoId }) => {
  const [apiData, setApiData] = useState(null);
  const [channelData, setChannelData] = useState(null);
  const [commentsData, setCommentsData] = useState([]);

  useEffect(() => {
    const getting = async () => {
      try {
        const videoDetail_url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoId}&key=${API_KEY}`;
        const response = await fetch(videoDetail_url);
        const data = await response.json();

        if (data.items?.length) {
          setApiData(data.items[0]);
        } else {
          console.error("Video not found:", data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    if (videoId) getting();
  }, [videoId]);

  useEffect(() => {
    const fetchOtherData = async () => {
      try {
        const channelData_url = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${apiData.snippet.channelId}&key=${API_KEY}`;
        const response = await fetch(channelData_url);
        const data = await response.json();

        if (data.items?.length) {
          setChannelData(data.items[0]);
        }
      } catch (error) {
        console.error("Error fetching channel data:", error);
      }
    };

    if (apiData?.snippet?.channelId) {
      fetchOtherData();
    }
  }, [apiData]);

  // ✅ Fetch comments inside useEffect
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const comment_url = `https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${API_KEY}&maxResults=90&order=relevance`;
        const response = await fetch(comment_url);
        const data = await response.json();
        setCommentsData(data.items || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
        setCommentsData([]);
      }
    };

    if (videoId) {
      fetchComments();
    }
  }, [videoId]);
  return (
    <div className="playvideo-container">
      {/* LEFT: Main Video Content */}
      <div className="main-content">
        {/* Video Player */}
        <iframe
          width="100%"
          height="500"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>

        {/* Video Info Below */}
        <div className={`video-content ${sidebar ? "expanded" : "collapsed"}`}>
          <h3>{apiData?.snippet?.title || "Loading..."}</h3>

          <div className="playvideo_info">
            <p>
              {apiData?.statistics?.viewCount
                ? value_convertor(parseInt(apiData.statistics.viewCount))
                : "0"}{" "}
              views &bull;{" "}
              {apiData?.snippet?.publishedAt
                ? moment(apiData.snippet.publishedAt).fromNow()
                : "Unknown date"}
            </p>
            <div className="video-actions">
              {/* Like with formatted count */}
              <span>
                <img src={like} alt="like" />{" "}
                {apiData?.statistics?.likeCount
                  ? value_convertor(parseInt(apiData.statistics.likeCount))
                  : "0"}
              </span>

              {/* Dislike with formatted count */}
              <span>
                <img src={dislike} alt="dislike" />{" "}
                {apiData?.statistics?.dislikeCount
                  ? value_convertor(parseInt(apiData.statistics.dislikeCount))
                  : "0"}
              </span>

              {/* Share */}
              <span>
                <img src={share} alt="share" /> Share
              </span>

              {/* Save */}
              <span>
                <img src={save} alt="save" /> Save
              </span>
            </div>
          </div>

          <hr />

          <div className="publisher">
            <img
              src={channelData?.snippet?.thumbnails?.high?.url || jack}
              alt="publisher"
              width="48"
              height="48"
            />
            <div>
              <p>{apiData?.snippet?.channelTitle || "Channel Name"}</p>
              <span>
                {channelData?.statistics?.subscriberCount &&
                channelData.statistics.subscriberCount !== "0"
                  ? value_convertor(
                      parseInt(channelData.statistics.subscriberCount)
                    )
                  : "0"}{" "}
                subscribers
              </span>
            </div>
            <button>Subscribe</button>
          </div>

          <div className="description">
            <p>
              <p className="description-text">
                {apiData?.snippet?.description
                  ? `${apiData.snippet.description.slice(0, 250)}...`
                  : "No description available."}
              </p>
            </p>
          </div>

          <hr />
          <h4>
            {apiData?.statistics?.commentCount
              ? value_convertor(apiData.statistics.commentCount)
              : "No"}{" "}
            comments
          </h4>

          {commentsData.map((item, index) => (
            <div className="comment" key={index}>
              <img
                src={item.snippet.topLevelComment.snippet.authorProfileImageUrl}
                alt="user"
              />
              <div>
                <h3>
                  {item.snippet.topLevelComment.snippet.authorDisplayName}{" "}
                  <span>
                    {moment(
                      item.snippet.topLevelComment.snippet.publishedAt
                    ).fromNow()}
                  </span>
                </h3>
                <p>{item.snippet.topLevelComment.snippet.textDisplay}</p>
                <div className="comment-action">
                  <img src={like} alt="like" />{" "}
                  <span>
                    {value_convertor(
                      item.snippet.topLevelComment.snippet.likeCount
                    )}
                  </span>
                  <img src={dislike} alt="dislike" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Recommended Videos */}
      <div className="recommended-section">
        <Recommended />
      </div>
    </div>
  );
};

export default PlayVideo;
