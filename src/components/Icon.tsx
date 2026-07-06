"use client";

import {
  MdAddCircle,
  MdAutoAwesome,
  MdBlock,
  MdCheckCircle,
  MdChat,
  MdChatBubble,
  MdChatBubbleOutline,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdDashboard,
  MdDelete,
  MdEdit,
  MdEditNote,
  MdError,
  MdErrorOutline,
  MdExpandMore,
  MdFavorite,
  MdFavoriteBorder,
  MdHistory,
  MdHistoryEdu,
  MdHourglassEmpty,
  MdInbox,
  MdInfo,
  MdLock,
  MdLogout,
  MdMenu,
  MdMoreHoriz,
  MdNotifications,
  MdNotificationsActive,
  MdNotificationsOff,
  MdPreview,
  MdReply,
  MdSave,
  MdSchedule,
  MdSelectAll,
  MdSend,
  MdShuffle,
  MdSpa,
  MdSupportAgent,
  MdVisibility,
  MdVisibilityOff,
  MdWallpaper,
} from "react-icons/md";
import type { IconType } from "react-icons";

const iconMap: Record<string, IconType> = {
  add_circle: MdAddCircle,
  auto_awesome: MdAutoAwesome,
  block: MdBlock,
  check_circle: MdCheckCircle,
  chat: MdChat,
  chat_bubble: MdChatBubble,
  chat_bubble_outline: MdChatBubbleOutline,
  chevron_left: MdChevronLeft,
  chevron_right: MdChevronRight,
  close: MdClose,
  dashboard: MdDashboard,
  delete: MdDelete,
  edit: MdEdit,
  edit_note: MdEditNote,
  error: MdError,
  error_outline: MdErrorOutline,
  expand_more: MdExpandMore,
  favorite: MdFavorite,
  favorite_border: MdFavoriteBorder,
  history: MdHistory,
  history_edu: MdHistoryEdu,
  hourglass_empty: MdHourglassEmpty,
  inbox: MdInbox,
  info: MdInfo,
  lock: MdLock,
  logout: MdLogout,
  menu: MdMenu,
  more_horiz: MdMoreHoriz,
  notifications: MdNotifications,
  notifications_active: MdNotificationsActive,
  notifications_off: MdNotificationsOff,
  preview: MdPreview,
  reply: MdReply,
  save: MdSave,
  schedule: MdSchedule,
  select_all: MdSelectAll,
  send: MdSend,
  shuffle: MdShuffle,
  spa: MdSpa,
  support_agent: MdSupportAgent,
  visibility: MdVisibility,
  visibility_off: MdVisibilityOff,
  wall_art: MdWallpaper,
};

interface IconProps {
  name: string;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  fill?: boolean;
}

export default function Icon({ name, size = 24, className = "", style, fill }: IconProps) {
  const MdIcon = iconMap[name];
  if (!MdIcon) {
    // Fallback: render the glyph name if the icon is not yet mapped
    return <span className={className} style={style}>{name}</span>;
  }

  // Convert fontVariationSettings-style fill to a CSS opacity/color trick isn't needed for SVG
  // Just apply custom style
  return (
    <MdIcon
      size={size}
      className={className}
      style={{
        ...style,
        ...(fill ? { fill: "currentColor" as any } : {}),
      }}
      aria-hidden="true"
    />
  );
}

export { iconMap };
