import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import {
  addComment,
  getComments,
  getReplies,
  toggleCommentLike
} from '../../utils/api';
import './Comments.css';

const CommentForm = ({ onSubmit, parentId = null, placeholder = 'Write a comment...' }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim(), parentId);
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        maxLength={1000}
      />
      <button type="submit" className="btn-primary" disabled={!content.trim()}>
        Post
      </button>
    </form>
  );
};

const Comment = ({ comment, onReply, onLike, showReplies = true }) => {
  const { user } = useUser();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState([]);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoadReplies = async () => {
    try {
      setLoading(true);
      const { data } = await getReplies(comment._id);
      setReplies(data.replies);
      setShowAllReplies(true);
    } catch (error) {
      console.error('Error loading replies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (content) => {
    try {
      const newReply = await onReply(content, comment._id);
      setReplies([newReply, ...replies]);
      setShowReplyForm(false);
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInHours = Math.floor((now - commentDate) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return commentDate.toLocaleDateString();
    }
  };

  return (
    <div className="comment">
      <div className="comment-header">
        <img
          src={comment.user.profileImage.url}
          alt={comment.user.name}
          className="user-avatar"
        />
        <div className="comment-info">
          <div className="comment-author">{comment.user.name}</div>
          <div className="comment-date">{formatDate(comment.createdAt)}</div>
        </div>
      </div>

      <div className="comment-content">
        {comment.content}
      </div>

      <div className="comment-actions">
        <button
          className={`btn-link ${comment.likes.includes(user?._id) ? 'liked' : ''}`}
          onClick={() => onLike(comment._id)}
        >
          ♥ {comment.likes.length}
        </button>
        {showReplies && (
          <button
            className="btn-link"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            Reply
          </button>
        )}
      </div>

      {showReplyForm && (
        <div className="reply-form">
          <CommentForm
            onSubmit={handleReply}
            placeholder="Write a reply..."
          />
        </div>
      )}

      {showReplies && comment.replyCount > 0 && !showAllReplies && (
        <button
          className="btn-link show-replies"
          onClick={handleLoadReplies}
          disabled={loading}
        >
          {loading ? 'Loading...' : `Show ${comment.replyCount} replies`}
        </button>
      )}

      {showAllReplies && replies.length > 0 && (
        <div className="replies">
          {replies.map(reply => (
            <Comment
              key={reply._id}
              comment={reply}
              onReply={onReply}
              onLike={onLike}
              showReplies={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Comments = ({ eventId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchComments();
  }, [eventId, page]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data } = await getComments(eventId, page);
      setComments(data.comments);
      setTotalPages(data.totalPages);
    } catch (error) {
      setError('Failed to load comments');
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (content, parentId = null) => {
    try {
      const { data } = await addComment(eventId, { content, parentComment: parentId });
      if (!parentId) {
        setComments([data, ...comments]);
      }
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const handleLike = async (commentId) => {
    try {
      const { data } = await toggleCommentLike(commentId);
      setComments(comments.map(comment =>
        comment._id === commentId
          ? { ...comment, likes: data.likes }
          : comment
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (loading) {
    return <div className="comments-loading">Loading comments...</div>;
  }

  if (error) {
    return <div className="comments-error">{error}</div>;
  }

  return (
    <div className="comments-section">
      <h3>Comments</h3>
      
      <CommentForm onSubmit={handleAddComment} />

      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="no-comments">No comments yet. Be the first to comment!</div>
        ) : (
          comments.map(comment => (
            <Comment
              key={comment._id}
              comment={comment}
              onReply={handleAddComment}
              onLike={handleLike}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="comments-pagination">
          <button
            className="btn-secondary"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            className="btn-secondary"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Comments; 