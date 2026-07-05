/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  uid: string;
  username: string;
  displayName: string;
  photoURL: string;
  coverURL?: string;
  bio: string;
  website?: string;
  gender?: string;
  dateJoined: string;
  isPrivate: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified: boolean;
  role: "user" | "admin" | "superadmin";
  status?: "online" | "offline";
  lastActive?: string;
  blockedUsers?: string[];
  mutedUsers?: string[];
  restrictedUsers?: string[];
}

export interface Post {
  id: string;
  authorId: string;
  mediaUrls: string[];
  mediaType: "image" | "video";
  caption: string;
  hashtags: string[];
  location?: string;
  taggedUsers?: string[];
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  isArchived: boolean;
  sensitive?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  likesCount: number;
}

export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  createdAt: string;
  expiresAt: string;
  viewers: string[]; // List of userIds
  likes?: string[]; // List of userIds
}

export interface Highlight {
  id: string;
  userId: string;
  title: string;
  coverUrl: string;
  storyIds: string[];
}

export interface Reel {
  id: string;
  authorId: string;
  videoUrl: string;
  caption: string;
  musicTitle?: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  mediaUrl?: string;
  mediaType?: "image" | "voice";
  createdAt: string;
  seen: boolean;
}

export interface Chat {
  id: string;
  participantIds: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  typing?: { [userId: string]: boolean };
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  type: "like" | "comment" | "follow" | "mention" | "message" | "story_reply" | "verification";
  postId?: string;
  storyId?: string;
  chatId?: string;
  createdAt: string;
  read: boolean;
  customText?: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string; // userId or postId
  reportedType: "user" | "post" | "comment" | "reel";
  reason: "Spam" | "Fake Account" | "Nudity" | "Violence" | "Hate Speech" | "Harassment" | "Scam" | "Copyright" | "Other";
  description?: string;
  evidenceUrl?: string;
  status: "Pending" | "Under Review" | "Resolved" | "Rejected";
  createdAt: string;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetId: string;
  timestamp: string;
  details?: string;
}
