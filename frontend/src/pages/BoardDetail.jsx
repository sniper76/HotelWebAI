import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

const BoardDetail = () => {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentContent, setCommentContent] = useState("");
    const [replyContent, setReplyContent] = useState("");
    const [activeReplyId, setActiveReplyId] = useState(null); // Which comment is being replied to

    useEffect(() => {
        fetchBoard();
    }, [id]);

    const fetchBoard = async () => {
        try {
            const response = await api.get(`/boards/${id}`);
            setBoard(response.data);
        } catch (error) {
            console.error("Failed to fetch board", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async () => {
        if (window.confirm(t("confirmDeletePost"))) {
            try {
                await api.delete(`/boards/${id}`);
                navigate("/boards");
            } catch (error) {
                console.error("Failed to delete post", error);
            }
        }
    };

    const handleToggleLike = async () => {
        if (!user) {
            alert(t("loginRequired")); // Or redirect to login
            return;
        }
        try {
            await api.post(`/boards/${id}/like`);
            fetchBoard(); // Refresh to get updated count and status
        } catch (error) {
            console.error("Failed to toggle like", error);
        }
    };

    const handleSubmitComment = async (e, parentId = null) => {
        e.preventDefault();
        try {
            const content = parentId ? replyContent : commentContent;
            if (!content.trim()) return;

            await api.post(`/boards/${id}/comments`, {
                content,
                parentId
            });

            // Clear inputs and refresh
            setCommentContent("");
            setReplyContent("");
            setActiveReplyId(null);
            fetchBoard();
        } catch (error) {
            console.error("Failed to submit comment", error);
            alert(t("bookingFailed")); // Generic error
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm(t("confirmDeletePost"))) { // Reuse confirm msg
            try {
                await api.delete(`/boards/comments/${commentId}`);
                fetchBoard();
            } catch (error) {
                console.error("Failed to delete comment", error);
            }
        }
    }

    if (loading) return <div className="container">{t("loading")}</div>;
    if (!board) return <div className="container">{t("searchFailed")}</div>;

    const isOwner = user && (user.username === board.createdBy || user.role === "ADMIN");

    let categoryText = 'QnA';
    switch (board.category) {
        case 'HOTEL_STORY':
            categoryText = t('hotelStory');
            break;
        case 'RESTAURANT_STORY':
            categoryText = t('restaurantStory');
            break;
        case 'BAR_STORY':
            categoryText = t('barStory');
            break;
    }

    return (
        <div className="container" style={{ marginTop: "2rem", maxWidth: "800px" }}>
            <div className="card">
                {/* Header */}
                <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "1rem" }}>
                    <span className="badge" style={{ marginBottom: "0.5rem", display: "inline-block" }}>
                        {categoryText}
                    </span>
                    <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{board.title}</h1>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                        <div>
                            <span style={{ marginRight: "1rem" }}>{t("author")}: {board.createdBy}</span>
                            <span>{t("date")}: {new Date(board.createdAt).toLocaleString()}</span>
                        </div>
                        <span>{t("views")}: {board.viewCount}</span>
                    </div>
                </div>

                {/* Content */}
                <div style={{ minHeight: "200px", marginBottom: "2rem", whiteSpace: "pre-wrap" }}>
                    {board.content}
                </div>

                {/* Like Button */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
                    <button
                        className="btn"
                        onClick={handleToggleLike}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            border: board.liked ? "1px solid var(--error)" : "1px solid var(--border)",
                            color: board.liked ? "var(--error)" : "var(--text)",
                            backgroundColor: board.liked ? "rgba(255, 0, 0, 0.05)" : "transparent"
                        }}
                    >
                        <span style={{ fontSize: "1.2rem" }}>{board.liked ? "❤️" : "🤍"}</span>
                        <span>{t("like")} {board.likeCount}</span>
                    </button>
                </div>

                {/* Actions */}
                {isOwner && (
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginBottom: "2rem" }}>
                        <button className="btn" onClick={() => navigate(`/boards/edit/${id}`)}>{t("editPost")}</button>
                        <button className="btn btn-primary" style={{ backgroundColor: "var(--error)" }} onClick={handleDeletePost}>{t("deletePost")}</button>
                    </div>
                )}

                <hr style={{ border: "0", borderTop: "1px solid var(--border)", margin: "2rem 0" }} />

                {/* Comments Section */}
                <h3>{t("comments")} ({board.comments ? board.comments.length + board.comments.reduce((acc, c) => acc + (c.replies ? c.replies.length : 0), 0) : 0})</h3>

                {/* Comment Form */}
                {user && (
                    <form onSubmit={(e) => handleSubmitComment(e)} style={{ marginBottom: "2rem" }}>
                        <div className="input-group">
                            <textarea
                                className="md-input"
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                placeholder={t("writeComment")}
                                rows="3"
                            />
                        </div>
                        <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
                            <button type="submit" className="btn btn-primary">{t("writeComment")}</button>
                        </div>
                    </form>
                )}

                {/* Comment List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {board.comments && board.comments.map(comment => (
                        <div key={comment.id} style={{ padding: "1rem", backgroundColor: "rgba(0,0,0,0.02)", borderRadius: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                <strong>{comment.createdBy}</strong>
                                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                    {new Date(comment.createdAt).toLocaleString()}
                                    {(user && (user.username === comment.createdBy || user.role === "ADMIN")) && (
                                        <button
                                            onClick={() => handleDeleteComment(comment.id)}
                                            style={{ border: "none", background: "none", color: "var(--error)", cursor: "pointer", marginLeft: "10px" }}
                                        >
                                            x
                                        </button>
                                    )}
                                </span>
                            </div>
                            <p style={{ margin: "0 0 0.5rem 0" }}>{comment.content}</p>

                            {user && (
                                <button
                                    className="btn"
                                    style={{ padding: "0", fontSize: "0.8rem" }}
                                    onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                                >
                                    {t("reply")}
                                </button>
                            )}

                            {/* Reply Form */}
                            {activeReplyId === comment.id && (
                                <form onSubmit={(e) => handleSubmitComment(e, comment.id)} style={{ marginTop: "0.5rem", marginLeft: "1rem" }}>
                                    <div className="input-group">
                                        <textarea
                                            className="md-input"
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder={t("writeComment")} // Reusing label
                                            rows="2"
                                        />
                                    </div>
                                    <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
                                        <button type="submit" className="btn btn-primary">{t("reply")}</button>
                                    </div>
                                </form>
                            )}

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div style={{ marginLeft: "1.5rem", marginTop: "1rem", borderLeft: "2px solid var(--border)", paddingLeft: "1rem" }}>
                                    {comment.replies.map(reply => (
                                        <div key={reply.id} style={{ marginBottom: "1rem" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                                                <strong>{reply.createdBy}</strong>
                                                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                                    {new Date(reply.createdAt).toLocaleString()}
                                                    {(user && (user.username === reply.createdBy || user.role === "ADMIN")) && (
                                                        <button
                                                            onClick={() => handleDeleteComment(reply.id)}
                                                            style={{ border: "none", background: "none", color: "var(--error)", cursor: "pointer", marginLeft: "10px" }}
                                                        >
                                                            x
                                                        </button>
                                                    )}
                                                </span>
                                            </div>
                                            <p style={{ margin: 0 }}>{reply.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BoardDetail;
