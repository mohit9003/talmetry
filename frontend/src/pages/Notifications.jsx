import React, { useEffect, useState } from "react";

const Notifications = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load notifications");
      }

      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(
        `http://localhost:8080/api/notifications/${id}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(
        "http://localhost:8080/api/notifications/read-all",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user?.token) {
      loadNotifications();
    }
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  if (loading) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-main">
          <div className="dashboard-content">
            <h1>Notifications</h1>
            <p>Loading notifications...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <main className="dashboard-main">
        <div className="dashboard-content">

          <div className="page-header">
            <div>
              <h1>Notifications 🔔</h1>
              <p>
                Stay updated with your applications and recruitment activity.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                className="primary-btn"
                onClick={markAllAsRead}
              >
                Mark All as Read
              </button>
            )}
          </div>

          <div className="notifications-card">

            {notifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔔</div>
                <h2>No notifications yet</h2>
                <p>
                  You will receive updates when your application status changes.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    notification.read ? "read" : "unread"
                  }`}
                  onClick={() =>
                    !notification.read &&
                    markAsRead(notification.id)
                  }
                >
                  <div className="notification-icon">
                    {notification.type === "APPLICATION_STATUS"
                      ? "📋"
                      : "📨"}
                  </div>

                  <div className="notification-content">
                    <p>{notification.message}</p>

                    <span>
                      {notification.createdAt
                        ? new Date(
                            notification.createdAt
                          ).toLocaleString()
                        : ""}
                    </span>
                  </div>

                  {!notification.read && (
                    <div className="unread-dot"></div>
                  )}
                </div>
              ))
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;