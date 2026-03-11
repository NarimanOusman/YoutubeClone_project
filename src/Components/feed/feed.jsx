import React, { useEffect, useState } from "react";
import "./feed.css";

import { Link } from "react-router-dom";
import value_convertor, { API_KEY } from "../../data";
import moment from "moment";
import { supabase } from "../../supabaseClient";

const feed = ({ category, searchQuery, savedVideos }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const communityFilterUserId = String(category).startsWith("community_user_")
    ? String(category).replace("community_user_", "")
    : null;

  const fetchCommunityPosts = async () => {
    let query = supabase
      .from("videos")
      .select("id, user_id, title, description, media_url, media_type, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (communityFilterUserId) {
      query = query.eq("user_id", communityFilterUserId);
    }

    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error("Error fetching community posts:", error);
      return [];
    }

    if (!posts || posts.length === 0) return [];

    // Fetch uploader profiles for all posts in one batch
    const userIds = [...new Set(posts.map((p) => p.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    const profileMap = {};
    (profiles || []).forEach((p) => { profileMap[p.id] = p; });

    return posts.map((post) => ({
      ...post,
      source: "community",
      profile: profileMap[post.user_id] || null
    }));
  };

  const fetchYoutubeVideos = async () => {
    if (communityFilterUserId) return [];

    if (!API_KEY) {
      console.error("YouTube API Key is missing! Please set VITE_YOUTUBE_API_KEY in your .env file (local) or Render dashboard (live).");
      return [];
    }

    let url = "";

    if (searchQuery) {
      url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=${searchQuery}&type=video&key=${API_KEY}`;
    } else if (String(category).startsWith("channel_")) {
      const channelId = String(category).split("_")[1];
      url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&channelId=${channelId}&type=video&order=date&key=${API_KEY}`;
    } else {
      url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&maxResults=50&regionCode=US&videoCategoryId=${category}&key=${API_KEY}`;
    }

    const response = await fetch(url);
    const youtubeData = await response.json();
    return (youtubeData.items || []).map((item) => ({ ...item, source: "youtube" }));
  };

  const fetchData = async () => {
    // If viewing saved videos, bypass API call
    if (category === "saved") {
      setData(savedVideos || []);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [youtubeVideos, communityPosts] = await Promise.all([
        fetchYoutubeVideos(),
        category === "0" || searchQuery || communityFilterUserId ? fetchCommunityPosts() : Promise.resolve([])
      ]);

      const mergedData = [...communityPosts, ...youtubeVideos];
      mergedData.sort((a, b) => {
        const aDate = a.source === "community" ? a.created_at : a.snippet?.publishedAt;
        const bDate = b.source === "community" ? b.created_at : b.snippet?.publishedAt;
        return new Date(bDate || 0) - new Date(aDate || 0);
      });

      setData(mergedData);
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
          {category !== "saved" && !API_KEY && <p style={{ color: "red" }}>Error: YouTube API Key is missing.</p>}
        </div>
      ) : (
        data.map((item, index) => {
          if (item.source === "community") {
            const postMedia = item.media_url;
            const isImage = item.media_type === "image";

            const uploaderName = item.profile?.full_name || "Community Member";
            const uploaderAvatar = item.profile?.avatar_url || null;

            return (
              <Link to={`/post/${item.id}`} className="card-link" key={`post-${item.id}`}>
                <div className="card community-card">
                  {isImage ? (
                    <img src={postMedia} alt={item.title} />
                  ) : (
                    <video src={postMedia} muted preload="metadata" />
                  )}
                  <h2>{item.title}</h2>
                  <div className="community-channel">
                    {uploaderAvatar ? (
                      <img src={uploaderAvatar} alt={uploaderName} className="community-avatar" />
                    ) : (
                      <div className="community-avatar community-avatar-placeholder">
                        {uploaderName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <p1>{uploaderName}</p1>
                  </div>
                  <p>--- views &bull; {moment(item.created_at).fromNow()}</p>
                </div>
              </Link>
            );
          }

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
