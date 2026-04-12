import { Badge, Button, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  markAllNotificationCenterItemsRead,
  markNotificationCenterItemRead,
  useNotificationCenterItems,
} from "../../lib/firebase/notificationCenterStore";

interface NotificationCenterProps {
  isDark: boolean;
}

const formatNotificationTime = (isoTime: string): string => {
  const date = new Date(isoTime);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const NotificationCenter = ({ isDark }: NotificationCenterProps) => {
  const navigate = useNavigate();
  const notifications = useNotificationCenterItems();
  const unreadCount = notifications.filter((item) => !item.read).length;

  const handleOpenLink = (id: string, link: string): void => {
    markNotificationCenterItemRead(id);
    if (/^https?:\/\//.test(link)) {
      window.location.assign(link);
      return;
    }

    navigate(link || "/");
  };

  return (
    <Dropdown align="end" className="me-2">
      <Dropdown.Toggle variant={isDark ? "outline-light" : "outline-dark"} size="sm" id="notification-center">
        🔔
        {unreadCount > 0 && (
          <Badge bg="danger" pill className="ms-1">
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu className={isDark ? "dropdown-menu-dark" : ""} style={{ minWidth: "22rem", maxWidth: "24rem" }}>
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <strong>Уведомления</strong>
          <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={markAllNotificationCenterItemsRead}>
            Прочитать все
          </Button>
        </div>
        <div style={{ maxHeight: "20rem", overflowY: "auto" }}>
          {notifications.length === 0 && <div className="px-3 py-2 text-muted">Пока нет уведомлений</div>}
          {notifications.map((item) => (
            <Dropdown.Item
              key={item.id}
              as="button"
              className="border-bottom py-2"
              onClick={() => handleOpenLink(item.id, item.link)}
            >
              <div className="d-flex justify-content-between align-items-start gap-2">
                <span className={item.read ? "" : "fw-semibold"}>{item.title}</span>
                <small className="text-muted">{formatNotificationTime(item.time)}</small>
              </div>
              <div className="small text-muted text-wrap">{item.body}</div>
            </Dropdown.Item>
          ))}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};
