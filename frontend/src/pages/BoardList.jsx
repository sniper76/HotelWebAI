import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import moment from "moment";

const BoardList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [notices, setNotices] = useState([]);
    const [boards, setBoards] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);

    // Filter states
    const [category, setCategory] = useState(searchParams.get("category") || "");
    const [searchType, setSearchType] = useState(searchParams.get("searchType") || "all");
    const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
    const [page, setPage] = useState(parseInt(searchParams.get("page") || "0"));

    const categories = [
        { value: "HOTEL_STORY", label: t("hotelStory") },
        { value: "RESTAURANT_STORY", label: t("restaurantStory") },
        { value: "BAR_STORY", label: t("barStory") },
        { value: "QNA", label: 'QnA' },
    ];

    useEffect(() => {
        fetchBoards();
    }, [page, category, searchParams]); // Fetch when these change

    const fetchBoards = async () => {
        setLoading(true);
        try {
            const params = {
                page: page,
                size: 10,
                sort: "createdAt,desc"
            };
            if (category) params.category = category;
            if (keyword && searchParams.get("keyword")) { // Only send if confirmed by search
                params.searchType = searchType;
                params.keyword = keyword;
            }

            const response = await api.get("/boards", { params });
            // Structure changed: { notices: [...], page: { content: [...], totalPages: ... } }
            setNotices(response.data.notices || []);
            setBoards(response.data.page.content);
            setTotalPages(response.data.page.totalPages);
        } catch (error) {
            console.error("Failed to fetch boards", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        // Update URL params
        const params = { page: 0 };
        if (category) params.category = category;
        if (keyword) {
            params.searchType = searchType;
            params.keyword = keyword;
        }
        setSearchParams(params);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        const params = Object.fromEntries(searchParams);
        params.page = newPage;
        setSearchParams(params);
    };

    const handleCategoryChange = (e) => {
        const newCat = e.target.value;
        setCategory(newCat);
        setPage(0);
        const params = Object.fromEntries(searchParams);
        params.category = newCat;
        params.page = 0;
        setSearchParams(params);
    };

    return (
        <div className="container" style={{ marginTop: "2rem" }}>
            <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h2>{t("freeBoard")}</h2>
                    {user && (
                        <button className="btn btn-primary" onClick={() => navigate("/boards/write")}>
                            {t("writePost")}
                        </button>
                    )}
                </div>

                {/* Search & Filter */}
                <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                    <select
                        className="input"
                        style={{ width: "auto" }}
                        value={category}
                        onChange={handleCategoryChange}
                    >
                        <option value="">{t("category")}: {t("searchByAll")}</option>
                        {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                    <select
                        className="input"
                        style={{ width: "auto" }}
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                    >
                        <option value="all">{t("searchByAll")}</option>
                        <option value="title">{t("searchByTitle")}</option>
                        <option value="content">{t("searchByContent")}</option>
                    </select>
                    <input
                        type="text"
                        className="input"
                        style={{ flex: 1, minWidth: "200px" }}
                        placeholder={t("keyword")}
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">{t("search")}</button>
                </form>

                {/* Table */}
                <div className="table-container">
                    <table className="md-table">
                        <thead>
                            <tr>
                                <th style={{ width: "7%" }}>No.</th>
                                <th style={{ width: "13%" }} className="desktop-only">{t("category")}</th>
                                <th style={{ width: "46%" }}>{t("title")}</th>
                                <th style={{ width: "10%" }}>{t("author")}</th>
                                <th style={{ width: "12%" }} className="desktop-only">{t("date")}</th>
                                <th style={{ width: "7%" }} className="desktop-only">{t("views")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Notices (Pinned) */}
                            {notices.map(notice => (
                                <tr key={`notice-${notice.id}`} onClick={() => navigate(`/boards/${notice.id}`)} style={{ cursor: "pointer", fontWeight: "bold" }}>
                                    <td>
                                        <span className="badge" style={{ backgroundColor: "var(--primary)", color: "white" }}>{t("notice")}</span>
                                    </td>
                                    <td className="desktop-only">
                                        <span className="badge">
                                            {categories.find(c => c.value === notice.category)?.label || notice.category}
                                        </span>
                                    </td>
                                    <td>
                                        {notice.title}
                                        {notice.commentCount > 0 && (
                                            <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                                💬 {notice.commentCount}
                                            </span>
                                        )}
                                        {notice.likeCount > 0 && (
                                            <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem", color: "var(--error)" }}>
                                                ❤️ {notice.likeCount}
                                            </span>
                                        )}
                                    </td>
                                    <td>{notice.fullName}</td>
                                    <td className="desktop-only">{moment(notice.createdAt).format("YYYY-MM-DD")}</td>
                                    <td className="desktop-only">{notice.viewCount}</td>
                                </tr>
                            ))}

                            {/* Normal Boards */}
                            {boards.length === 0 && notices.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                                        {t("noPosts")}
                                    </td>
                                </tr>
                            ) : (
                                boards.map(board => (
                                    <tr key={board.id} onClick={() => navigate(`/boards/${board.id}`)} style={{ cursor: "pointer" }}>
                                        <td>{board.id}</td>
                                        <td className="desktop-only">
                                            <span className="badge">
                                                {categories.find(c => c.value === board.category)?.label || board.category}
                                            </span>
                                        </td>
                                        <td>
                                            {board.title}
                                            {board.commentCount > 0 && (
                                                <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                                    💬 {board.commentCount}
                                                </span>
                                            )}
                                            {board.likeCount > 0 && (
                                                <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem", color: "var(--error)" }}>
                                                    ❤️ {board.likeCount}
                                                </span>
                                            )}
                                        </td>
                                        <td>{board.fullName}</td>
                                        <td className="desktop-only">{moment(board.createdAt).format("YYYY-MM-DD")}</td>
                                        <td className="desktop-only">{board.viewCount}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem", gap: "0.5rem" }}>
                    <button
                        className="btn"
                        disabled={page === 0}
                        onClick={() => handlePageChange(page - 1)}
                    >
                        &lt;
                    </button>
                    <span style={{ display: "flex", alignItems: "center" }}>
                        {page + 1} / {totalPages || 1}
                    </span>
                    <button
                        className="btn"
                        disabled={page >= totalPages - 1}
                        onClick={() => handlePageChange(page + 1)}
                    >
                        &gt;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BoardList;
