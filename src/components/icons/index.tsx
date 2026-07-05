/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Home as LucideHome,
  Search as LucideSearch,
  PlusSquare as LucidePlusSquare,
  Clapperboard as LucideReels,
  MessageCircle as LucideMessage,
  Bell as LucideBell,
  User as LucideUser,
  Settings as LucideSettings,
  Heart as LucideHeart,
  MessageSquare as LucideComment,
  Send as LucideSend,
  Bookmark as LucideBookmark,
  MoreHorizontal as LucideMore,
  ArrowLeft as LucideBack,
  X as LucideX,
  CheckCircle2 as LucideVerified,
  Grid as LucideGrid,
  Archive as LucideArchive,
  Trash2 as LucideTrash,
  Lock as LucideLock,
  Shield as LucideShield,
  Eye as LucideEye,
  LogOut as LucideLogOut,
  Image as LucideImage,
  Video as LucideVideo,
  ChevronLeft as LucideChevronLeft,
  ChevronRight as LucideChevronRight,
  Info as LucideInfo,
  Flag as LucideFlag,
  UserX as LucideBlock,
  VolumeX as LucideMute,
  EyeOff as LucideHide,
  Compass as LucideTrending
} from "lucide-react";

interface IconProps {
  filled?: boolean;
  size?: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const HomeIcon: React.FC<IconProps> = ({ filled, size = 24, className = "", onClick }) => (
  <LucideHome
    size={size}
    className={`${className} cursor-pointer transition-all duration-200`}
    fill={filled ? "currentColor" : "none"}
    onClick={onClick}
  />
);

export const SearchIcon: React.FC<IconProps> = ({ filled, size = 24, className = "", onClick }) => (
  <LucideSearch
    size={size}
    className={`${className} cursor-pointer transition-all duration-200 ${filled ? "stroke-[2.5px]" : "stroke-[2px]"}`}
    onClick={onClick}
  />
);

export const PlusIcon: React.FC<IconProps> = ({ filled, size = 24, className = "", onClick }) => (
  <LucidePlusSquare
    size={size}
    className={`${className} cursor-pointer transition-all duration-200`}
    fill={filled ? "currentColor" : "none"}
    onClick={onClick}
  />
);

export const ReelsIcon: React.FC<IconProps> = ({ filled, size = 24, className = "", onClick }) => (
  <LucideReels
    size={size}
    className={`${className} cursor-pointer transition-all duration-200`}
    fill={filled ? "currentColor" : "none"}
    onClick={onClick}
  />
);

export const MessageIcon: React.FC<IconProps> = ({ filled, size = 24, className = "", onClick }) => (
  <LucideMessage
    size={size}
    className={`${className} cursor-pointer transition-all duration-200`}
    fill={filled ? "currentColor" : "none"}
    onClick={onClick}
  />
);

export const NotificationsIcon: React.FC<IconProps> = ({ filled, size = 24, className = "", onClick }) => (
  <LucideBell
    size={size}
    className={`${className} cursor-pointer transition-all duration-200`}
    fill={filled ? "currentColor" : "none"}
    onClick={onClick}
  />
);

export const ProfileIcon: React.FC<IconProps> = ({ filled, size = 24, className = "", onClick }) => (
  <LucideUser
    size={size}
    className={`${className} cursor-pointer transition-all duration-200`}
    fill={filled ? "currentColor" : "none"}
    onClick={onClick}
  />
);

export const SettingsIcon: React.FC<IconProps> = ({ filled, size = 24, className = "", onClick }) => (
  <LucideSettings
    size={size}
    className={`${className} cursor-pointer transition-all duration-200 ${filled ? "rotate-45" : ""}`}
    onClick={onClick}
  />
);

export const HeartIcon: React.FC<IconProps> = ({ filled, size = 24, className = "", onClick }) => (
  <LucideHeart
    size={size}
    className={`${className} cursor-pointer transition-all duration-200 ${
      filled ? "text-rose-500 scale-110" : ""
    }`}
    fill={filled ? "currentColor" : "none"}
    onClick={onClick}
  />
);

export const CommentIcon: React.FC<IconProps> = ({ filled, size = 24, className = "", onClick }) => (
  <LucideComment
    size={size}
    className={`${className} cursor-pointer transition-all duration-200`}
    fill={filled ? "currentColor" : "none"}
    onClick={onClick}
  />
);

export const ShareIcon: React.FC<IconProps> = ({ size = 24, className = "", onClick }) => (
  <LucideSend
    size={size}
    className={`${className} cursor-pointer transition-all duration-200`}
    onClick={onClick}
  />
);

export const BookmarkIcon: React.FC<IconProps> = ({ filled, size = 24, className = "", onClick }) => (
  <LucideBookmark
    size={size}
    className={`${className} cursor-pointer transition-all duration-200`}
    fill={filled ? "currentColor" : "none"}
    onClick={onClick}
  />
);

export const MoreIcon: React.FC<IconProps> = ({ size = 24, className = "", onClick }) => (
  <LucideMore
    size={size}
    className={`${className} cursor-pointer transition-all duration-200`}
    onClick={onClick}
  />
);

export const BackIcon: React.FC<IconProps> = ({ size = 24, className = "", onClick }) => (
  <LucideBack
    size={size}
    className={`${className} cursor-pointer transition-all duration-200`}
    onClick={onClick}
  />
);

export const CloseIcon: React.FC<IconProps> = ({ size = 24, className = "", onClick }) => (
  <LucideX
    size={size}
    className={`${className} cursor-pointer transition-all duration-200`}
    onClick={onClick}
  />
);

export const VerifiedIcon: React.FC<IconProps> = ({ size = 16, className = "text-sky-500 inline" }) => (
  <LucideVerified
    size={size}
    className={`${className}`}
    fill="currentColor"
    stroke="white"
  />
);

export const GridIcon: React.FC<IconProps> = ({ filled, size = 24, className = "", onClick }) => (
  <LucideGrid
    size={size}
    className={`${className} cursor-pointer`}
    onClick={onClick}
  />
);

export const ArchiveIcon: React.FC<IconProps> = ({ filled, size = 24, className = "", onClick }) => (
  <LucideArchive
    size={size}
    className={`${className} cursor-pointer`}
    onClick={onClick}
  />
);

export const TrashIcon: React.FC<IconProps> = ({ size = 24, className = "", onClick }) => (
  <LucideTrash
    size={size}
    className={`${className} text-rose-500 cursor-pointer`}
    onClick={onClick}
  />
);

export const LockIcon: React.FC<IconProps> = ({ size = 16, className = "" }) => (
  <LucideLock
    size={size}
    className={`${className}`}
  />
);

export const ShieldIcon: React.FC<IconProps> = ({ size = 24, className = "", onClick }) => (
  <LucideShield
    size={size}
    className={`${className} cursor-pointer`}
    onClick={onClick}
  />
);

export const EyeIcon: React.FC<IconProps> = ({ size = 24, className = "", onClick }) => (
  <LucideEye
    size={size}
    className={`${className} cursor-pointer`}
    onClick={onClick}
  />
);

export const LogOutIcon: React.FC<IconProps> = ({ size = 24, className = "", onClick }) => (
  <LucideLogOut
    size={size}
    className={`${className} cursor-pointer`}
    onClick={onClick}
  />
);

export const ImageIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <LucideImage
    size={size}
    className={`${className}`}
  />
);

export const VideoIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <LucideVideo
    size={size}
    className={`${className}`}
  />
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ size = 24, className = "", onClick }) => (
  <LucideChevronLeft
    size={size}
    className={`${className} cursor-pointer`}
    onClick={onClick}
  />
);

export const ChevronRightIcon: React.FC<IconProps> = ({ size = 24, className = "", onClick }) => (
  <LucideChevronRight
    size={size}
    className={`${className} cursor-pointer`}
    onClick={onClick}
  />
);

export const InfoIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <LucideInfo
    size={size}
    className={`${className}`}
  />
);

export const FlagIcon: React.FC<IconProps> = ({ size = 18, className = "", onClick }) => (
  <LucideFlag
    size={size}
    className={`${className} cursor-pointer`}
    onClick={onClick}
  />
);

export const BlockIcon: React.FC<IconProps> = ({ size = 18, className = "", onClick }) => (
  <LucideBlock
    size={size}
    className={`${className} cursor-pointer text-rose-500`}
    onClick={onClick}
  />
);

export const MuteIcon: React.FC<IconProps> = ({ size = 18, className = "", onClick }) => (
  <LucideMute
    size={size}
    className={`${className} cursor-pointer text-amber-500`}
    onClick={onClick}
  />
);

export const HideIcon: React.FC<IconProps> = ({ size = 18, className = "", onClick }) => (
  <LucideHide
    size={size}
    className={`${className} cursor-pointer`}
    onClick={onClick}
  />
);

export const TrendingIcon: React.FC<IconProps> = ({ size = 24, className = "", onClick }) => (
  <LucideTrending
    size={size}
    className={`${className} cursor-pointer`}
    onClick={onClick}
  />
);
