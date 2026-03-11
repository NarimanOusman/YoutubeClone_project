import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, Save, Trash2, X } from "lucide-react";
import { supabase } from "../../supabaseClient";
import ConfirmDialog from "../../Components/ConfirmDialog/ConfirmDialog";
import "./MyPosts.css";

const MyPosts = () => {
  const [session, setSession] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [postToDelete, setPostToDelete] = useState(null);
  const [editingPostId, setEditingPostId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const navigate = useNavigate();

  const fetchMyPosts = async (userId) => {
    const { data, error } = await supabase
      .from("videos")
      .select("id, title, description, media_url, media_type, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      return;
    }

    setPosts(data || []);
  };

  useEffect(() => {
    const init = async () => {
      const { data: authData } = await supabase.auth.getSession();
      const currentSession = authData.session;

      if (!currentSession) {
        navigate("/login");
        return;
      }

      setSession(currentSession);
      await fetchMyPosts(currentSession.user.id);
      setLoading(false);
    };

    init();
  }, [navigate]);

  const removeFromStorage = async (mediaUrl) => {
    const splitToken = "/storage/v1/object/public/videos/";
    if (!mediaUrl.includes(splitToken)) return;

    const objectPath = decodeURIComponent(mediaUrl.split(splitToken)[1]?.split("?")[0] || "");
    if (!objectPath) return;

    await supabase.storage.from("videos").remove([objectPath]);
  };

  const handleDelete = async (post) => {
    setDeletingId(post.id);

    try {
      await removeFromStorage(post.media_url);

      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", post.id)
        .eq("user_id", session.user.id);

      if (error) throw error;

      setPosts((prev) => prev.filter((item) => item.id !== post.id));
    } catch (error) {
      alert(`Failed to delete post: ${error.message}`);
    } finally {
      setDeletingId("");
    }
  };

  const startEdit = (post) => {
    setEditingPostId(post.id);
    setEditTitle(post.title || "");
    setEditDescription(post.description || "");
  };

  const cancelEdit = () => {
    setEditingPostId("");
    setEditTitle("");
    setEditDescription("");
  };

  const saveEdit = async () => {
    if (!editingPostId) return;

    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      alert("Title is required.");
      return;
    }

    setSavingEdit(true);

    try {
      const { error } = await supabase
        .from("videos")
        .update({
          title: trimmedTitle,
          description: editDescription.trim()
        })
        .eq("id", editingPostId)
        .eq("user_id", session.user.id);

      if (error) throw error;

      setPosts((prev) => prev.map((item) => (
        item.id === editingPostId
          ? { ...item, title: trimmedTitle, description: editDescription.trim() }
          : item
      )));

      cancelEdit();
    } catch (error) {
      alert(`Failed to update post: ${error.message}`);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="my-posts-page">
      <div className="my-posts-header">
        <h1>My Posts</h1>
        <p>Manage your uploaded videos and images.</p>
      </div>

      {loading ? (
        <div className="my-posts-empty">Loading your posts...</div>
      ) : posts.length === 0 ? (
        <div className="my-posts-empty">
          <h3>No posts yet</h3>
          <p>Upload from your profile page and they will appear here.</p>
          <Link to="/profile" className="my-posts-action">Go to Profile</Link>
        </div>
      ) : (
        <div className="my-posts-grid">
          {posts.map((post) => (
            <div className="my-post-card" key={post.id}>
              <Link to={`/post/${post.id}`}>
                {post.media_type === "image" ? (
                  <img src={post.media_url} alt={post.title} />
                ) : (
                  <video src={post.media_url} muted preload="metadata" />
                )}
              </Link>

              <div className="my-post-content">
                {editingPostId === post.id ? (
                  <>
                    <input
                      className="post-edit-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Post title"
                    />
                    <textarea
                      className="post-edit-textarea"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Post description"
                      rows={3}
                    />
                    <div className="my-post-buttons">
                      <button className="edit-post-btn" disabled={savingEdit} onClick={saveEdit}>
                        <Save size={16} />
                        {savingEdit ? "Saving..." : "Save"}
                      </button>
                      <button className="ghost-post-btn" disabled={savingEdit} onClick={cancelEdit}>
                        <X size={16} /> Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to={`/post/${post.id}`} className="my-post-title">
                      {post.title}
                    </Link>
                    <p>{new Date(post.created_at).toLocaleString()}</p>
                    <div className="my-post-buttons">
                      <button className="edit-post-btn" onClick={() => startEdit(post)}>
                        <Pencil size={16} /> Edit
                      </button>
                      <button
                        className="delete-post-btn"
                        disabled={deletingId === post.id}
                        onClick={() => setPostToDelete(post)}
                      >
                        <Trash2 size={16} />
                        {deletingId === post.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(postToDelete)}
        title="Delete This Post?"
        message="Do you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={Boolean(postToDelete && deletingId === postToDelete.id)}
        onCancel={() => {
          if (!deletingId) setPostToDelete(null);
        }}
        onConfirm={async () => {
          if (!postToDelete) return;
          await handleDelete(postToDelete);
          setPostToDelete(null);
        }}
      />
    </div>
  );
};

export default MyPosts;
