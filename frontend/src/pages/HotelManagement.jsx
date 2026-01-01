import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useTranslation } from "react-i18next";

const HotelManagement = () => {
  const [hotels, setHotels] = useState([]);
  const [showAddHotel, setShowAddHotel] = useState(false);
  const [newHotel, setNewHotel] = useState({
    name: "",
    address: "",
    description: "",
    useYn: "Y",
  });
  const { t } = useTranslation();

  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [newRoomType, setNewRoomType] = useState({
    name: "",
    description: "",
    capacity: 2,
    priceKrw: 0,
    priceUsd: 0,
    pricePhp: 0,
    useYn: "Y",
  });

  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(null);
  const [newRoomNumber, setNewRoomNumber] = useState("");

  const [editingHotelId, setEditingHotelId] = useState(null);
  const [editHotelData, setEditHotelData] = useState({});

  const [editingRoomTypeId, setEditingRoomTypeId] = useState(null);
  const [editRoomTypeData, setEditRoomTypeData] = useState({});

  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editRoomData, setEditRoomData] = useState({});

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await api.get("/owner/hotels");
      setHotels(response.data);
    } catch (error) {
      console.error("Failed to fetch hotels", error);
    }
  };

  const handleCreateHotel = async (e) => {
    e.preventDefault();
    try {
      await api.post("/owner/hotels", newHotel);
      setShowAddHotel(false);
      setNewHotel({ name: "", address: "", description: "", useYn: "Y" });
      fetchHotels();
    } catch (error) {
      alert("Failed to create hotel");
    }
  };

  const handleUpdateHotel = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/owner/hotels/${editingHotelId}`, editHotelData);
      setEditingHotelId(null);
      fetchHotels();
    } catch (error) {
      alert("Failed to update hotel");
    }
  };

  const startEditHotel = (hotel) => {
    setEditingHotelId(hotel.id);
    setEditHotelData({
      name: hotel.name,
      address: hotel.address,
      description: hotel.description,
      useYn: hotel.useYn || "Y",
    });
  };

  const handleAddRoomType = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        `/owner/hotels/${selectedHotelId}/room-types`,
        newRoomType
      );
      setSelectedHotelId(null);
      setNewRoomType({
        name: "",
        description: "",
        capacity: 2,
        priceKrw: 0,
        priceUsd: 0,
        pricePhp: 0,
        useYn: "Y",
      });
      fetchHotels();
    } catch (error) {
      alert("Failed to add room type");
    }
  };

  const handleUpdateRoomType = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/owner/room-types/${editingRoomTypeId}`, editRoomTypeData);
      setEditingRoomTypeId(null);
      fetchHotels();
    } catch (error) {
      alert("Failed to update room type");
    }
  };

  const startEditRoomType = (rt) => {
    setEditingRoomTypeId(rt.id);
    setEditRoomTypeData({
      name: rt.name,
      description: rt.description,
      capacity: rt.capacity,
      priceKrw: rt.priceKrw || 0,
      priceUsd: rt.priceUsd || 0,
      pricePhp: rt.pricePhp || 0,
      useYn: rt.useYn || "Y",
    });
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/owner/room-types/${selectedRoomTypeId}/rooms`, {
        roomNumber: newRoomNumber,
        useYn: "Y",
      });
      setSelectedRoomTypeId(null);
      setNewRoomNumber("");
      fetchHotels();
    } catch (error) {
      alert("Failed to add room");
    }
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/owner/rooms/${editingRoomId}`, editRoomData);
      setEditingRoomId(null);
      fetchHotels();
    } catch (error) {
      alert("Failed to update room");
    }
  };

  return (
    <div className="container" style={{ marginTop: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h2>{t("manageHotels")}</h2>
        <button
          onClick={() => setShowAddHotel(!showAddHotel)}
          className="btn btn-primary"
        >
          {showAddHotel ? t("cancel") : t("addNewHotel")}
        </button>
      </div>

      {showAddHotel && (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <h3>{t("addHotel")}</h3>
          <form
            onSubmit={handleCreateHotel}
            style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}
          >
            <input
              placeholder={t("name")}
              className="input"
              style={{ width: "97%" }}
              value={newHotel.name}
              onChange={(e) =>
                setNewHotel({ ...newHotel, name: e.target.value })
              }
              required
            />
            <input
              placeholder={t("address")}
              className="input"
              style={{ width: "97%" }}
              value={newHotel.address}
              onChange={(e) =>
                setNewHotel({ ...newHotel, address: e.target.value })
              }
            />
            <textarea
              placeholder={t("description")}
              className="input"
              style={{ width: "97%" }}
              value={newHotel.description}
              onChange={(e) =>
                setNewHotel({ ...newHotel, description: e.target.value })
              }
            />
            <select
              className="input"
              style={{ width: "97%" }}
              value={newHotel.useYn}
              onChange={(e) => setNewHotel({ ...newHotel, useYn: e.target.value })}
            >
              <option value="Y">Use: Y</option>
              <option value="N">Use: N</option>
            </select>
            <button type="submit" className="btn btn-primary">
              {t("create")}
            </button>
          </form>
        </div>
      )}

      <div style={{ display: "grid", gap: "2rem" }}>
        {hotels.map((hotel) => (
          <div key={hotel.id} className="card">
            {editingHotelId === hotel.id ? (
              <form
                onSubmit={handleUpdateHotel}
                style={{ display: "grid", gap: "0.5rem", marginBottom: "1rem" }}
              >
                <input
                  placeholder={t("name")}
                  className="input"
                  style={{ width: "97%" }}
                  value={editHotelData.name}
                  onChange={(e) =>
                    setEditHotelData({ ...editHotelData, name: e.target.value })
                  }
                  required
                />
                <input
                  placeholder={t("address")}
                  className="input"
                  style={{ width: "97%" }}
                  value={editHotelData.address}
                  onChange={(e) =>
                    setEditHotelData({
                      ...editHotelData,
                      address: e.target.value,
                    })
                  }
                />
                <textarea
                  placeholder={t("description")}
                  className="input"
                  style={{ width: "97%" }}
                  value={editHotelData.description}
                  onChange={(e) =>
                    setEditHotelData({
                      ...editHotelData,
                      description: e.target.value,
                    })
                  }
                />
                <select
                  className="input"
                  style={{ width: "97%" }}
                  value={editHotelData.useYn}
                  onChange={(e) => setEditHotelData({ ...editHotelData, useYn: e.target.value })}
                >
                  <option value="Y">Use: Y</option>
                  <option value="N">Use: N</option>
                </select>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button type="submit" className="btn btn-primary">
                    {t("save")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingHotelId(null)}
                    className="btn"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    {t("cancel")}
                  </button>
                </div>
              </form>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                    {hotel.name}{" "}
                    <span
                      onClick={() => startEditHotel(hotel)}
                      style={{
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        color: "var(--primary)",
                      }}
                    >
                      [{t("edit")}]
                    </span>
                  </h3>
                  <p style={{ color: "var(--text-muted)" }}>{hotel.address}</p>
                </div>
                <button
                  onClick={() =>
                    setSelectedHotelId(
                      selectedHotelId === hotel.id ? null : hotel.id
                    )
                  }
                  className="btn"
                  style={{ border: "1px solid var(--border)" }}
                >
                  {t("addRoomType")}
                </button>
              </div>
            )}

            {selectedHotelId === hotel.id && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: "0.5rem",
                }}
              >
                <h4>{t("newRoomType")}</h4>
                <form
                  onSubmit={handleAddRoomType}
                  style={{ display: "grid", gap: "0.5rem" }}
                >
                  <input
                    placeholder={t("typeName")}
                    className="input"
                    style={{ width: "97%" }}
                    value={newRoomType.name}
                    onChange={(e) =>
                      setNewRoomType({ ...newRoomType, name: e.target.value })
                    }
                    required
                  />
                  <input
                    type="number"
                    placeholder={t("capacity")}
                    className="input"
                    style={{ width: "97%" }}
                    value={newRoomType.capacity}
                    onChange={(e) =>
                      setNewRoomType({
                        ...newRoomType,
                        capacity: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                      gap: "0.5rem",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        marginTop: "0.5rem",
                        color: "var(--text-muted)",
                        width: "90%",
                      }}
                    >
                      Price (KRW)
                    </label>
                    <input
                      type="number"
                      placeholder="Price (KRW)"
                      className="input"
                      style={{ width: "90%" }}
                      value={newRoomType.priceKrw}
                      onChange={(e) =>
                        setNewRoomType({
                          ...newRoomType,
                          priceKrw: parseFloat(e.target.value),
                        })
                      }
                      required
                    />
                    <label
                      style={{
                        display: "block",
                        marginTop: "0.5rem",
                        marginLeft: "1rem",
                        color: "var(--text-muted)",
                        width: "90%",
                      }}
                    >
                      Price (USD)
                    </label>
                    <input
                      type="number"
                      placeholder="Price (USD)"
                      className="input"
                      style={{ width: "90%" }}
                      value={newRoomType.priceUsd}
                      onChange={(e) =>
                        setNewRoomType({
                          ...newRoomType,
                          priceUsd: parseFloat(e.target.value),
                        })
                      }
                      required
                    />
                    <label
                      style={{
                        display: "block",
                        marginTop: "0.5rem",
                        marginLeft: "1rem",
                        color: "var(--text-muted)",
                        width: "90%",
                      }}
                    >
                      Price (PHP)
                    </label>
                    <input
                      type="number"
                      placeholder="Price (PHP)"
                      className="input"
                      style={{ width: "90%" }}
                      value={newRoomType.pricePhp}
                      onChange={(e) =>
                        setNewRoomType({
                          ...newRoomType,
                          pricePhp: parseFloat(e.target.value),
                        })
                      }
                      required
                    />
                    <select
                      className="input"
                      style={{ width: "90%" }}
                      value={newRoomType.useYn}
                      onChange={(e) => setNewRoomType({ ...newRoomType, useYn: e.target.value })}
                    >
                      <option value="Y">Use: Y</option>
                      <option value="N">Use: N</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    {t("addType")}
                  </button>
                </form>
              </div>
            )}

            <div style={{ marginTop: "1.5rem" }}>
              <h4 style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>
                {t("roomTypesAndRooms")}
              </h4>
              {hotel.roomTypes &&
                hotel.roomTypes.map((rt) => (
                  <div
                    key={rt.id}
                    style={{
                      marginLeft: "1rem",
                      marginBottom: "1rem",
                      paddingLeft: "1rem",
                      borderLeft: "2px solid var(--border)",
                    }}
                  >
                    {editingRoomTypeId === rt.id ? (
                      <form
                        onSubmit={handleUpdateRoomType}
                        style={{
                          display: "grid",
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <input
                          placeholder={t("typeName")}
                          className="input"
                          value={editRoomTypeData.name}
                          onChange={(e) =>
                            setEditRoomTypeData({
                              ...editRoomTypeData,
                              name: e.target.value,
                            })
                          }
                          required
                        />
                        <input
                          type="number"
                          placeholder={t("capacity")}
                          className="input"
                          value={editRoomTypeData.capacity}
                          onChange={(e) =>
                            setEditRoomTypeData({
                              ...editRoomTypeData,
                              capacity: parseInt(e.target.value),
                            })
                          }
                          required
                        />
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "0.5rem",
                          }}
                        >
                          <input
                            type="number"
                            placeholder="Price (KRW)"
                            className="input"
                            value={editRoomTypeData.priceKrw}
                            onChange={(e) =>
                              setEditRoomTypeData({
                                ...editRoomTypeData,
                                priceKrw: parseFloat(e.target.value),
                              })
                            }
                            required
                          />
                          <input
                            type="number"
                            placeholder="Price (USD)"
                            className="input"
                            value={editRoomTypeData.priceUsd}
                            onChange={(e) =>
                              setEditRoomTypeData({
                                ...editRoomTypeData,
                                priceUsd: parseFloat(e.target.value),
                              })
                            }
                            required
                          />
                          <input
                            type="number"
                            placeholder="Price (PHP)"
                            className="input"
                            value={editRoomTypeData.pricePhp}
                            onChange={(e) =>
                              setEditRoomTypeData({
                                ...editRoomTypeData,
                                pricePhp: parseFloat(e.target.value),
                              })
                            }
                            required
                          />
                          <select
                            className="input"
                            value={editRoomTypeData.useYn}
                            onChange={(e) => setEditRoomTypeData({ ...editRoomTypeData, useYn: e.target.value })}
                          >
                            <option value="Y">Y</option>
                            <option value="N">N</option>
                          </select>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                          >
                            {t("save")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRoomTypeId(null)}
                            className="btn btn-sm"
                            style={{ border: "1px solid var(--border)" }}
                          >
                            {t("cancel")}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <strong>{rt.name}</strong>{" "}
                          <span
                            onClick={() => startEditRoomType(rt)}
                            style={{
                              fontSize: "0.8rem",
                              cursor: "pointer",
                              color: "var(--primary)",
                            }}
                          >
                            [{t("edit")}]
                          </span>{" "}
                          ({t("capacity")}: {rt.capacity})
                          <div
                            style={{
                              fontSize: "0.9rem",
                              color: "var(--text-muted)",
                            }}
                          >
                            {rt.priceKrw && `₩${rt.priceKrw} `}
                            {rt.priceUsd && `$${rt.priceUsd} `}
                            {rt.pricePhp && `₱${rt.pricePhp}`}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setSelectedRoomTypeId(
                              selectedRoomTypeId === rt.id ? null : rt.id
                            )
                          }
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--primary)",
                            cursor: "pointer",
                          }}
                        >
                          {t("addRoom")}
                        </button>
                      </div>
                    )}

                    {selectedRoomTypeId === rt.id && (
                      <form
                        onSubmit={handleAddRoom}
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          marginTop: "0.5rem",
                        }}
                      >
                        <input
                          placeholder={t("roomNumber")}
                          className="input"
                          style={{ marginBottom: 0 }}
                          value={newRoomNumber}
                          onChange={(e) => setNewRoomNumber(e.target.value)}
                          required
                        />
                        <select
                          className="input"
                          style={{ marginBottom: 0, width: "80px" }}
                          value="Y"
                          disabled
                        >
                          <option value="Y">Y</option>
                        </select>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          style={{ padding: "0.5rem 1rem" }}
                        >
                          {t("add")}
                        </button>
                      </form>
                    )}

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      {rt.rooms &&
                        rt.rooms.map((r) => (
                          <span
                            key={r.id}
                            style={{
                              padding: "0.25rem 0.5rem",
                              backgroundColor: "var(--background)",
                              borderRadius: "0.25rem",
                              fontSize: "0.9rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            {editingRoomId === r.id ? (
                              <form
                                onSubmit={handleUpdateRoom}
                                style={{ display: "flex", gap: "0.25rem" }}
                              >
                                <input
                                  className="input"
                                  style={{
                                    padding: "0.1rem 0.25rem",
                                    width: "60px",
                                    marginBottom: 0,
                                  }}
                                  value={editRoomData.roomNumber}
                                  onChange={(e) =>
                                    setEditRoomData({
                                      ...editRoomData,
                                      roomNumber: e.target.value,
                                    })
                                  }
                                />
                                <select
                                  className="input"
                                  style={{ padding: "0.1rem 0.25rem", marginBottom: 0 }}
                                  value={editRoomData.useYn || "Y"}
                                  onChange={(e) => setEditRoomData({ ...editRoomData, useYn: e.target.value })}
                                >
                                  <option value="Y">Y</option>
                                  <option value="N">N</option>
                                </select>
                                <button
                                  type="submit"
                                  style={{
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    color: "var(--primary)",
                                  }}
                                >
                                  ✓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingRoomId(null)}
                                  style={{
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    color: "var(--text-muted)",
                                  }}
                                >
                                  ✕
                                </button>
                              </form>
                            ) : (
                              <>
                                {r.roomNumber}
                                <span
                                  onClick={() => {
                                    setEditingRoomId(r.id);
                                    setEditRoomData({
                                      roomNumber: r.roomNumber,
                                      useYn: r.useYn || "Y",
                                    });
                                  }}
                                  style={{
                                    cursor: "pointer",
                                    opacity: 0.5,
                                    fontSize: "0.8rem",
                                  }}
                                >
                                  ✎
                                </span>
                              </>
                            )}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelManagement;
