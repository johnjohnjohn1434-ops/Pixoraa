/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  User, Post, Comment, Story, Reel, Message, Chat, Notification, Report, Highlight, AdminLog 
} from "../types";
import { auth, db } from "../firebase/config";
import { 
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  signOut, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup, updateProfile,
  User as FirebaseUser
} from "firebase/auth";
import { 
  doc, setDoc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, 
  onSnapshot, query, where, orderBy, limit, serverTimestamp, increment
} from "firebase/firestore";

// High-fidelity seed data for offline / empty DB fallback
const SEED_USERS: User[] = [
  {
    uid: "alice_pix",
    username: "alice_pix",
    displayName: "Alice Johnson",
    photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    coverURL: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    bio: "Travel Photographer 📸. Wandering the globe. Visual storyteller.",
    website: "https://alicephoto.com",
    dateJoined: "2026-01-15T12:00:00Z",
    isPrivate: false,
    followersCount: 1420,
    followingCount: 382,
    postsCount: 3,
    isVerified: true,
    role: "user"
  },
  {
    uid: "bob_builder",
    username: "bob_builder",
    displayName: "Bob Miller",
    photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    coverURL: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
    bio: "Creative UI Designer & React Developer. Coffee addict ☕.",
    website: "https://bobbuilds.dev",
    dateJoined: "2026-02-10T09:30:00Z",
    isPrivate: false,
    followersCount: 845,
    followingCount: 512,
    postsCount: 3,
    isVerified: false,
    role: "user"
  },
  {
    uid: "charlie_ventures",
    username: "charlie_ventures",
    displayName: "Charlie Brown",
    photoURL: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
    coverURL: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800",
    bio: "Crypto & Web3 builder. Tech explorer. Fitness enthusiast.",
    website: "https://charlie.eth",
    dateJoined: "2026-03-01T15:45:00Z",
    isPrivate: true,
    followersCount: 320,
    followingCount: 290,
    postsCount: 2,
    isVerified: false,
    role: "user"
  },
  {
    uid: "pixora_official",
    username: "pixora_official",
    displayName: "Pixora Official",
    photoURL: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=150",
    coverURL: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800",
    bio: "Welcome to Pixora! Share Moments. Build Community. 🌟 Tag #Pixora to be featured.",
    website: "https://pixora.social",
    dateJoined: "2026-01-01T00:00:00Z",
    isPrivate: false,
    followersCount: 15400,
    followingCount: 45,
    postsCount: 2,
    isVerified: true,
    role: "superadmin"
  }
];

const SEED_POSTS: Post[] = [
  {
    id: "post_1",
    authorId: "alice_pix",
    mediaUrls: ["https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800"],
    mediaType: "image",
    caption: "Waking up to views like this makes the 4 AM hike completely worth it! 🌄 #sunrise #nature #hiking #wanderlust",
    hashtags: ["sunrise", "nature", "hiking", "wanderlust"],
    location: "Yosemite National Park",
    createdAt: "2026-07-04T13:20:00Z",
    likesCount: 248,
    commentsCount: 3,
    viewsCount: 1250,
    isArchived: false
  },
  {
    id: "post_2",
    authorId: "bob_builder",
    mediaUrls: ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800"],
    mediaType: "image",
    caption: "Late night coding session. Refactoring Pixora's animation layers. Frame-by-frame precision! 💻✨ #coding #react #developer #uidesign",
    hashtags: ["coding", "react", "developer", "uidesign"],
    location: "San Francisco, CA",
    createdAt: "2026-07-04T22:05:00Z",
    likesCount: 112,
    commentsCount: 2,
    viewsCount: 620,
    isArchived: false
  },
  {
    id: "post_3",
    authorId: "charlie_ventures",
    mediaUrls: ["https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"],
    mediaType: "image",
    caption: "Best workspace in the city. High speed internet and great single-origin pour-overs ☕️ #workspace #digitalnomad #coffee",
    hashtags: ["workspace", "digitalnomad", "coffee"],
    location: "Blue Bottle Coffee",
    createdAt: "2026-07-05T01:10:00Z",
    likesCount: 64,
    commentsCount: 1,
    viewsCount: 340,
    isArchived: false
  },
  {
    id: "post_4",
    authorId: "pixora_official",
    mediaUrls: ["https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800"],
    mediaType: "image",
    caption: "Welcome to our beautiful new design. Experience smooth transitions, instant messaging, stories, and immersive video feeds. We are so excited to build this community with you! ❤️✨ #Pixora #Community #Launch",
    hashtags: ["Pixora", "Community", "Launch"],
    location: "Pixora HQ",
    createdAt: "2026-07-03T10:00:00Z",
    likesCount: 1245,
    commentsCount: 4,
    viewsCount: 5200,
    isArchived: false
  }
];

const SEED_COMMENTS: Comment[] = [
  {
    id: "comment_1",
    postId: "post_1",
    authorId: "bob_builder",
    content: "This is breathtaking, Alice! The colors are insane.",
    createdAt: "2026-07-04T14:02:00Z",
    likesCount: 12
  },
  {
    id: "comment_2",
    postId: "post_1",
    authorId: "charlie_ventures",
    content: "Which trail did you take? Adding this to my list!",
    createdAt: "2026-07-04T15:30:00Z",
    likesCount: 4
  },
  {
    id: "comment_3",
    postId: "post_1",
    authorId: "pixora_official",
    content: "Spectacular capture! 🌟",
    createdAt: "2026-07-04T16:00:00Z",
    likesCount: 1
  },
  {
    id: "comment_4",
    postId: "post_2",
    authorId: "alice_pix",
    content: "Looks clean! The fonts make a huge difference.",
    createdAt: "2026-07-04T22:45:00Z",
    likesCount: 8
  },
  {
    id: "comment_5",
    postId: "post_2",
    authorId: "pixora_official",
    content: "Keep up the incredible development, Bob!",
    createdAt: "2026-07-05T00:15:00Z",
    likesCount: 2
  },
  {
    id: "comment_6",
    postId: "post_3",
    authorId: "bob_builder",
    content: "Let's co-work there next week!",
    createdAt: "2026-07-05T02:00:00Z",
    likesCount: 3
  }
];

const SEED_STORIES: Story[] = [
  {
    id: "story_1",
    userId: "alice_pix",
    mediaUrl: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=500",
    mediaType: "image",
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
    viewers: ["bob_builder"]
  },
  {
    id: "story_2",
    userId: "bob_builder",
    mediaUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500",
    mediaType: "image",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 22 * 3600 * 1000).toISOString(),
    viewers: []
  },
  {
    id: "story_3",
    userId: "charlie_ventures",
    mediaUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=500",
    mediaType: "image",
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 16 * 3600 * 1000).toISOString(),
    viewers: ["alice_pix", "bob_builder"]
  }
];

const SEED_REELS: Reel[] = [
  {
    id: "reel_1",
    authorId: "alice_pix",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4",
    caption: "Finding peace in the wilderness 🌿🏞️ #naturelovers #reels #calm",
    musicTitle: "Alice Original Audio - Nature Ambient",
    likesCount: 3200,
    commentsCount: 45,
    viewsCount: 15400,
    createdAt: "2026-07-02T10:00:00Z"
  },
  {
    id: "reel_2",
    authorId: "bob_builder",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-working-on-a-laptop-from-home-4751-large.mp4",
    caption: "Setting up the new productivity station 🖥️⚡ #desksetup #developer #remotework",
    musicTitle: "Lofi Beats - Chill Coders",
    likesCount: 1840,
    commentsCount: 22,
    viewsCount: 9400,
    createdAt: "2026-07-03T14:30:00Z"
  },
  {
    id: "reel_3",
    authorId: "charlie_ventures",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-pouring-hot-water-on-ground-coffee-beans-41551-large.mp4",
    caption: "Morning coffee ritual ☕❤️ Pour over perfection.",
    musicTitle: "Jazz Cafe Collective - Morning Pour",
    likesCount: 540,
    commentsCount: 11,
    viewsCount: 2800,
    createdAt: "2026-07-04T08:00:00Z"
  }
];

const SEED_CHATS: Chat[] = [
  {
    id: "chat_1",
    participantIds: ["alice_pix", "bob_builder"],
    lastMessage: "I'll upload the design files tonight!",
    lastMessageAt: "2026-07-05T02:10:00Z"
  }
];

const SEED_MESSAGES: Message[] = [
  {
    id: "msg_1",
    chatId: "chat_1",
    senderId: "alice_pix",
    text: "Hey Bob! How are the animation revisions looking?",
    createdAt: "2026-07-05T01:55:00Z",
    seen: true
  },
  {
    id: "msg_2",
    chatId: "chat_1",
    senderId: "bob_builder",
    text: "They are looking super smooth! Just tweaking the timing on the feed transitions.",
    createdAt: "2026-07-05T02:05:00Z",
    seen: true
  },
  {
    id: "msg_3",
    chatId: "chat_1",
    senderId: "bob_builder",
    text: "I'll upload the design files tonight!",
    createdAt: "2026-07-05T02:10:00Z",
    seen: false
  }
];

// Helper to load or write localStorage state
const loadLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(`pixora_${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const saveLocalStorage = <T,>(key: string, data: T) => {
  try {
    localStorage.setItem(`pixora_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error("Local storage save failed", e);
  }
};

interface AppContextType {
  currentUser: User | null;
  users: User[];
  posts: Post[];
  comments: Comment[];
  stories: Story[];
  highlights: Highlight[];
  reels: Reel[];
  chats: Chat[];
  messages: Message[];
  notifications: Notification[];
  reports: Report[];
  adminLogs: AdminLog[];
  savedPosts: string[]; // List of postIds
  followingIds: string[]; // List of userIds current user is following
  followerIds: string[]; // List of userIds following current user
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Navigation / Deep Linking Actions
  selectedPostId: string | null;
  setSelectedPostId: (id: string | null) => void;
  selectedUsername: string | null;
  setSelectedUsername: (username: string | null) => void;
  selectedChatId: string | null;
  setSelectedChatId: (id: string | null) => void;
  selectedStoryUserId: string | null;
  setSelectedStoryUserId: (uid: string | null) => void;
  selectedHighlightId: string | null;
  setSelectedHighlightId: (id: string | null) => void;

  // Actions
  handleLogin: (email: string, password: string) => Promise<void>;
  handleGoogleLogin: () => Promise<void>;
  handleSignup: (username: string, displayName: string, email: string, pass: string) => Promise<void>;
  handleLogout: () => Promise<void>;
  handleResetPassword: (email: string) => Promise<void>;
  handleUpdateProfile: (data: Partial<User>) => Promise<void>;
  handleDeleteAccount: () => Promise<void>;

  // Content Actions
  handleLikePost: (postId: string) => Promise<void>;
  handleSavePost: (postId: string) => Promise<void>;
  handleCreatePost: (mediaUrls: string[], mediaType: "image" | "video", caption: string, location?: string) => Promise<void>;
  handleDeletePost: (postId: string) => Promise<void>;
  handleArchivePost: (postId: string) => Promise<void>;
  handleCreateComment: (postId: string, content: string) => Promise<void>;
  handleDeleteComment: (commentId: string) => Promise<void>;
  
  // Follow/Connection Actions
  handleFollowUser: (targetUid: string) => Promise<void>;
  handleBlockUser: (targetUid: string) => Promise<void>;
  handleMuteUser: (targetUid: string) => Promise<void>;
  
  // Story & Reel Actions
  handleCreateStory: (mediaUrl: string, mediaType: "image" | "video") => Promise<void>;
  handleLikeStory: (storyId: string) => Promise<void>;
  handleViewStory: (storyId: string) => Promise<void>;
  handleCreateHighlight: (title: string, coverUrl: string, storyIds: string[]) => Promise<void>;
  handleLikeReel: (reelId: string) => Promise<void>;

  // Messaging Actions
  handleSendMessage: (chatId: string, text: string, mediaUrl?: string, mediaType?: "image" | "voice") => Promise<void>;
  handleCreateChat: (targetUid: string) => Promise<string>;
  handleSetTyping: (chatId: string, isTyping: boolean) => void;

  // Safety & Moderation (Reporting)
  handleReport: (reportedId: string, reportedType: "user" | "post" | "comment" | "reel", reason: string, description?: string) => Promise<void>;

  // Admin Controls
  handleAdminAction: (actionType: string, targetId: string, details?: string) => Promise<void>;
  handleUpdateReportStatus: (reportId: string, status: "Pending" | "Under Review" | "Resolved" | "Rejected") => Promise<void>;
  handleGiveVerified: (userId: string, isVerified: boolean) => Promise<void>;
  handleUpdateUserRole: (userId: string, role: "user" | "admin" | "superadmin") => Promise<void>;
  handleDeleteUserAccount: (userId: string) => Promise<void>;
  
  // Client Preference Settings
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation tabs state (home, explore, reels, messages, profile, settings, admin)
  const [activeTab, setActiveTab] = useState<string>("home");

  // Deep linking item states
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedStoryUserId, setSelectedStoryUserId] = useState<string | null>(null);
  const [selectedHighlightId, setSelectedHighlightId] = useState<string | null>(null);

  // App settings state
  const [darkMode, setDarkMode] = useState<boolean>(() => loadLocalStorage("dark_mode", false));
  const [language, setLanguage] = useState<string>(() => loadLocalStorage("lang", "en"));

  // Primary Entities State (sync with localStorage as base and fallback)
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadLocalStorage("current_user", null));
  const [users, setUsers] = useState<User[]>(() => loadLocalStorage("users", SEED_USERS));
  const [posts, setPosts] = useState<Post[]>(() => loadLocalStorage("posts", SEED_POSTS));
  const [comments, setComments] = useState<Comment[]>(() => loadLocalStorage("comments", SEED_COMMENTS));
  const [stories, setStories] = useState<Story[]>(() => loadLocalStorage("stories", SEED_STORIES));
  const [highlights, setHighlights] = useState<Highlight[]>(() => loadLocalStorage("highlights", []));
  const [reels, setReels] = useState<Reel[]>(() => loadLocalStorage("reels", SEED_REELS));
  const [chats, setChats] = useState<Chat[]>(() => loadLocalStorage("chats", SEED_CHATS));
  const [messages, setMessages] = useState<Message[]>(() => loadLocalStorage("messages", SEED_MESSAGES));
  const [notifications, setNotifications] = useState<Notification[]>(() => loadLocalStorage("notifications", []));
  const [reports, setReports] = useState<Report[]>(() => loadLocalStorage("reports", []));
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>(() => loadLocalStorage("admin_logs", []));

  // Current User details derived
  const [savedPosts, setSavedPosts] = useState<string[]>(() => loadLocalStorage("saved_posts", []));
  const [followingIds, setFollowingIds] = useState<string[]>(() => loadLocalStorage("following_ids", []));
  const [followerIds, setFollowerIds] = useState<string[]>(() => loadLocalStorage("follower_ids", []));

  // Sync to local storage on changes
  useEffect(() => {
    saveLocalStorage("current_user", currentUser);
    if (currentUser) {
      // Keep local user object in sync with users list
      const u = users.find(x => x.uid === currentUser.uid);
      if (u && JSON.stringify(u) !== JSON.stringify(currentUser)) {
        setCurrentUser(u);
      }
    }
  }, [currentUser, users]);

  useEffect(() => { saveLocalStorage("users", users); }, [users]);
  useEffect(() => { saveLocalStorage("posts", posts); }, [posts]);
  useEffect(() => { saveLocalStorage("comments", comments); }, [comments]);
  useEffect(() => { saveLocalStorage("stories", stories); }, [stories]);
  useEffect(() => { saveLocalStorage("highlights", highlights); }, [highlights]);
  useEffect(() => { saveLocalStorage("reels", reels); }, [reels]);
  useEffect(() => { saveLocalStorage("chats", chats); }, [chats]);
  useEffect(() => { saveLocalStorage("messages", messages); }, [messages]);
  useEffect(() => { saveLocalStorage("notifications", notifications); }, [notifications]);
  useEffect(() => { saveLocalStorage("reports", reports); }, [reports]);
  useEffect(() => { saveLocalStorage("admin_logs", adminLogs); }, [adminLogs]);
  useEffect(() => { saveLocalStorage("saved_posts", savedPosts); }, [savedPosts]);
  useEffect(() => { saveLocalStorage("following_ids", followingIds); }, [followingIds]);
  useEffect(() => { saveLocalStorage("follower_ids", followerIds); }, [followerIds]);
  useEffect(() => { saveLocalStorage("dark_mode", darkMode); }, [darkMode]);
  useEffect(() => { saveLocalStorage("lang", language); }, [language]);

  // Dark Mode class toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // -------------------------------------------------------------
  // FIREBASE SYNCHRONIZATION (AUTHENTICATION & STATE LISTENERS)
  // -------------------------------------------------------------
  useEffect(() => {
    // 1. Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Try fetching user details from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setCurrentUser(userData);
            
            // Sync roles and counts
            setFollowingIds(userData.blockedUsers || []);
          } else {
            // Create profile in Firestore if it doesn't exist
            const username = firebaseUser.email?.split("@")[0] || "user_" + firebaseUser.uid.substring(0, 5);
            const newUser: User = {
              uid: firebaseUser.uid,
              username: username,
              displayName: firebaseUser.displayName || username,
              photoURL: firebaseUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
              bio: "Hey there! I am using Pixora.",
              dateJoined: new Date().toISOString(),
              isPrivate: false,
              followersCount: 0,
              followingCount: 0,
              postsCount: 0,
              isVerified: false,
              role: "user"
            };
            await setDoc(doc(db, "users", firebaseUser.uid), newUser);
            setCurrentUser(newUser);
          }
        } catch (e) {
          console.warn("Firestore Auth Sync error, using local storage user.", e);
          // If auth is verified but DB write failed, make sure we have a local user loaded
          if (!currentUser) {
            const username = firebaseUser.email?.split("@")[0] || "user_" + firebaseUser.uid.substring(0, 5);
            const localUser: User = {
              uid: firebaseUser.uid,
              username: username,
              displayName: firebaseUser.displayName || username,
              photoURL: firebaseUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
              bio: "Hey there! I am using Pixora.",
              dateJoined: new Date().toISOString(),
              isPrivate: false,
              followersCount: 0,
              followingCount: 0,
              postsCount: 0,
              isVerified: false,
              role: firebaseUser.email === "tthivashthivash@gmail.com" ? "superadmin" : "user"
            };
            setCurrentUser(localUser);
            // Append to local users
            setUsers(prev => prev.some(x => x.uid === localUser.uid) ? prev : [...prev, localUser]);
          }
        }
      } else {
        // Logged out
        // Note: Keep mock seed session active if they want to browse without formal Firebase signup,
        // or support anonymous browsing session. For Pixora, if no formal Auth, they start with mock user "bob_builder" or "alice_pix" or log in.
        // Let's keep their local auth state if they loaded the page so they don't get kicked out.
      }
    });

    // 2. Real-time Firebase listeners (try-catch guarded to fallback to local in-memory state on permissions errors)
    let unsubUsers = () => {};
    let unsubPosts = () => {};
    let unsubComments = () => {};
    let unsubStories = () => {};
    let unsubReels = () => {};
    let unsubChats = () => {};
    let unsubMessages = () => {};
    let unsubReports = () => {};

    try {
      unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
        const list: User[] = [];
        snap.forEach(d => list.push(d.data() as User));
        if (list.length > 0) setUsers(list);
      }, (err) => console.log("Users snapshot blocked/offline", err));

      unsubPosts = onSnapshot(collection(db, "posts"), (snap) => {
        const list: Post[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() } as Post));
        if (list.length > 0) setPosts(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }, (err) => console.log("Posts snapshot blocked/offline", err));

      unsubComments = onSnapshot(collection(db, "comments"), (snap) => {
        const list: Comment[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() } as Comment));
        if (list.length > 0) setComments(list);
      }, (err) => console.log("Comments snapshot blocked/offline", err));

      unsubStories = onSnapshot(collection(db, "stories"), (snap) => {
        const list: Story[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() } as Story));
        if (list.length > 0) {
          // Filter expired stories (expired > 24h)
          const now = new Date().getTime();
          setStories(list.filter(s => new Date(s.expiresAt).getTime() > now));
        }
      }, (err) => console.log("Stories snapshot blocked/offline", err));

      unsubReels = onSnapshot(collection(db, "reels"), (snap) => {
        const list: Reel[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() } as Reel));
        if (list.length > 0) setReels(list);
      }, (err) => console.log("Reels snapshot blocked/offline", err));

      unsubChats = onSnapshot(collection(db, "chats"), (snap) => {
        const list: Chat[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() } as Chat));
        if (list.length > 0) setChats(list);
      }, (err) => console.log("Chats snapshot blocked/offline", err));

      unsubMessages = onSnapshot(collection(db, "messages"), (snap) => {
        const list: Message[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() } as Message));
        if (list.length > 0) setMessages(list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      }, (err) => console.log("Messages snapshot blocked/offline", err));

      unsubReports = onSnapshot(collection(db, "reports"), (snap) => {
        const list: Report[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() } as Report));
        if (list.length > 0) setReports(list);
      }, (err) => console.log("Reports snapshot blocked/offline", err));

    } catch (e) {
      console.warn("Real-time Firebase listener setup blocked or offline. Falling back to robust Local State.", e);
    }

    return () => {
      unsubscribeAuth();
      unsubUsers();
      unsubPosts();
      unsubComments();
      unsubStories();
      unsubReels();
      unsubChats();
      unsubMessages();
      unsubReports();
    };
  }, []);

  // -------------------------------------------------------------
  // AUTHENTICATION INTERFACES
  // -------------------------------------------------------------
  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      // user will be loaded by onAuthStateChanged.
    } catch (e: any) {
      // Local Auth Fail Fallback (if they want to test offline with standard credential or custom)
      const matchedUser = users.find(u => u.username === email.split("@")[0] || u.displayName.toLowerCase().includes(email.split("@")[0]));
      if (matchedUser) {
        setCurrentUser(matchedUser);
      } else {
        // Create an in-memory test user session
        const demoUser: User = {
          uid: "demo_" + Math.random().toString(36).substring(2, 7),
          username: email.split("@")[0],
          displayName: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
          photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
          bio: "Welcome to my Pixora! (Test Offline Mode)",
          dateJoined: new Date().toISOString(),
          isPrivate: false,
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          isVerified: true,
          role: email === "tthivashthivash@gmail.com" ? "superadmin" : "user"
        };
        setCurrentUser(demoUser);
        setUsers(prev => [...prev, demoUser]);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      // Offline simulation
      const randomId = "google_" + Math.random().toString(36).substring(2, 7);
      const googleUser: User = {
        uid: randomId,
        username: "google_pioneer",
        displayName: "Google Pioneer",
        photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        bio: "Joined Pixora with Google! (Simulated Mode)",
        dateJoined: new Date().toISOString(),
        isPrivate: false,
        followersCount: 15,
        followingCount: 10,
        postsCount: 0,
        isVerified: true,
        role: "user"
      };
      setCurrentUser(googleUser);
      setUsers(prev => [...prev, googleUser]);
    }
  };

  const handleSignup = async (username: string, displayName: string, email: string, pass: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser: User = {
        uid: res.user.uid,
        username: username.toLowerCase().replace(/\s+/g, ""),
        displayName: displayName,
        photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        bio: "Creative mind exploring Pixora! ✨",
        dateJoined: new Date().toISOString(),
        isPrivate: false,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        isVerified: false,
        role: email === "tthivashthivash@gmail.com" ? "superadmin" : "user"
      };
      await setDoc(doc(db, "users", res.user.uid), newUser);
      setCurrentUser(newUser);
    } catch (e) {
      // Local setup fallback
      const localId = "user_" + Math.random().toString(36).substring(2, 7);
      const localUser: User = {
        uid: localId,
        username: username.toLowerCase().replace(/\s+/g, ""),
        displayName: displayName,
        photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        bio: "Creative mind exploring Pixora! ✨ (Offline Mode)",
        dateJoined: new Date().toISOString(),
        isPrivate: false,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        isVerified: false,
        role: email === "tthivashthivash@gmail.com" ? "superadmin" : "user"
      };
      setCurrentUser(localUser);
      setUsers(prev => [...prev, localUser]);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setCurrentUser(null);
    setSavedPosts([]);
    setFollowingIds([]);
    setFollowerIds([]);
    setActiveTab("home");
  };

  const handleResetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e) {
      console.warn("Password reset email trigger skipped / offline.");
    }
  };

  const handleUpdateProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.uid === currentUser.uid ? updated : u));

    try {
      await updateDoc(doc(db, "users", currentUser.uid), data);
    } catch (e) {
      console.warn("Profile update failed in Firestore", e);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    // Cleanup local state
    setPosts(prev => prev.filter(p => p.authorId !== uid));
    setComments(prev => prev.filter(c => c.authorId !== uid));
    setStories(prev => prev.filter(s => s.userId !== uid));
    setReels(prev => prev.filter(r => r.authorId !== uid));
    setUsers(prev => prev.filter(u => u.uid !== uid));
    
    try {
      await deleteDoc(doc(db, "users", uid));
      await auth.currentUser?.delete();
    } catch (e) {
      console.warn("Firestore delete account cascading clean up error", e);
    }
    handleLogout();
  };

  // -------------------------------------------------------------
  // POST & ENGAGEMENT ACTIONS
  // -------------------------------------------------------------
  const handleLikePost = async (postId: string) => {
    if (!currentUser) return;

    // Check if we liked it previously
    // For simplicity, we toggle like counts. In real, we'd record likes in a collection
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const hasLiked = savedPosts.includes(`liked_${postId}`);
        const countDiff = hasLiked ? -1 : 1;
        
        // update saved posts tracking liked status
        if (hasLiked) {
          setSavedPosts(s => s.filter(x => x !== `liked_${postId}`));
        } else {
          setSavedPosts(s => [...s, `liked_${postId}`]);
          // send notification to poster
          if (p.authorId !== currentUser.uid) {
            sendNotification(p.authorId, "like", postId);
          }
        }

        return { ...p, likesCount: Math.max(0, p.likesCount + countDiff) };
      }
      return p;
    }));

    try {
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const postData = postSnap.data() as Post;
        const hasLiked = savedPosts.includes(`liked_${postId}`);
        await updateDoc(postRef, {
          likesCount: increment(hasLiked ? -1 : 1)
        });
      }
    } catch (e) {}
  };

  const handleSavePost = async (postId: string) => {
    if (!currentUser) return;
    const isSaved = savedPosts.includes(postId);
    if (isSaved) {
      setSavedPosts(prev => prev.filter(id => id !== postId));
    } else {
      setSavedPosts(prev => [...prev, postId]);
    }
  };

  const handleCreatePost = async (mediaUrls: string[], mediaType: "image" | "video", caption: string, location?: string) => {
    if (!currentUser) return;
    
    // Auto-parse hashtags
    const hashtags = caption.match(/#[a-zA-Z0-9_]+/g)?.map(h => h.slice(1).toLowerCase()) || [];

    const newPost: Post = {
      id: "post_" + Math.random().toString(36).substring(2, 9),
      authorId: currentUser.uid,
      mediaUrls,
      mediaType,
      caption,
      hashtags,
      location,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0,
      isArchived: false
    };

    setPosts(prev => [newPost, ...prev]);
    // update count
    setUsers(prev => prev.map(u => u.uid === currentUser.uid ? { ...u, postsCount: u.postsCount + 1 } : u));

    try {
      await setDoc(doc(db, "posts", newPost.id), newPost);
      await updateDoc(doc(db, "users", currentUser.uid), {
        postsCount: increment(1)
      });
    } catch (e) {
      console.warn("Create post failed in Firestore, using local", e);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!currentUser) return;
    setPosts(prev => prev.filter(p => p.id !== postId));
    setComments(prev => prev.filter(c => c.postId !== postId));
    setUsers(prev => prev.map(u => u.uid === currentUser.uid ? { ...u, postsCount: Math.max(0, u.postsCount - 1) } : u));

    try {
      await deleteDoc(doc(db, "posts", postId));
      await updateDoc(doc(db, "users", currentUser.uid), {
        postsCount: increment(-1)
      });
    } catch (e) {}
  };

  const handleArchivePost = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isArchived: !p.isArchived } : p));
    try {
      const pRef = doc(db, "posts", postId);
      const snap = await getDoc(pRef);
      if (snap.exists()) {
        await updateDoc(pRef, { isArchived: !snap.data().isArchived });
      }
    } catch (e) {}
  };

  const handleCreateComment = async (postId: string, content: string) => {
    if (!currentUser) return;

    const newComment: Comment = {
      id: "comment_" + Math.random().toString(36).substring(2, 9),
      postId,
      authorId: currentUser.uid,
      content,
      createdAt: new Date().toISOString(),
      likesCount: 0
    };

    setComments(prev => [...prev, newComment]);
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        if (p.authorId !== currentUser.uid) {
          sendNotification(p.authorId, "comment", postId);
        }
        return { ...p, commentsCount: p.commentsCount + 1 };
      }
      return p;
    }));

    try {
      await setDoc(doc(db, "comments", newComment.id), newComment);
      await updateDoc(doc(db, "posts", postId), {
        commentsCount: increment(1)
      });
    } catch (e) {}
  };

  const handleDeleteComment = async (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    setComments(prev => prev.filter(c => c.id !== commentId));
    setPosts(prev => prev.map(p => p.id === comment.postId ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) } : p));

    try {
      await deleteDoc(doc(db, "comments", commentId));
      await updateDoc(doc(db, "posts", comment.postId), {
        commentsCount: increment(-1)
      });
    } catch (e) {}
  };

  // -------------------------------------------------------------
  // FOLLOW, BLOCK, MUTE SYSTEM
  // -------------------------------------------------------------
  const handleFollowUser = async (targetUid: string) => {
    if (!currentUser || currentUser.uid === targetUid) return;

    const isFollowing = followingIds.includes(targetUid);
    let newFollowing = [...followingIds];
    
    if (isFollowing) {
      newFollowing = newFollowing.filter(id => id !== targetUid);
    } else {
      newFollowing.push(targetUid);
      sendNotification(targetUid, "follow");
    }

    setFollowingIds(newFollowing);

    // Update counts locally
    setUsers(prev => prev.map(u => {
      if (u.uid === currentUser.uid) {
        return { ...u, followingCount: Math.max(0, u.followingCount + (isFollowing ? -1 : 1)) };
      }
      if (u.uid === targetUid) {
        return { ...u, followersCount: Math.max(0, u.followersCount + (isFollowing ? -1 : 1)) };
      }
      return u;
    }));

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        followingCount: increment(isFollowing ? -1 : 1)
      });
      await updateDoc(doc(db, "users", targetUid), {
        followersCount: increment(isFollowing ? -1 : 1)
      });
    } catch (e) {}
  };

  const handleBlockUser = async (targetUid: string) => {
    if (!currentUser) return;
    const blockedList = currentUser.blockedUsers || [];
    const isBlocked = blockedList.includes(targetUid);
    const newBlocked = isBlocked ? blockedList.filter(id => id !== targetUid) : [...blockedList, targetUid];
    
    await handleUpdateProfile({ blockedUsers: newBlocked });
  };

  const handleMuteUser = async (targetUid: string) => {
    if (!currentUser) return;
    const mutedList = currentUser.mutedUsers || [];
    const isMuted = mutedList.includes(targetUid);
    const newMuted = isMuted ? mutedList.filter(id => id !== targetUid) : [...mutedList, targetUid];

    await handleUpdateProfile({ mutedUsers: newMuted });
  };

  // -------------------------------------------------------------
  // STORY & REEL ACTIONS
  // -------------------------------------------------------------
  const handleCreateStory = async (mediaUrl: string, mediaType: "image" | "video") => {
    if (!currentUser) return;

    const newStory: Story = {
      id: "story_" + Math.random().toString(36).substring(2, 9),
      userId: currentUser.uid,
      mediaUrl,
      mediaType,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      viewers: [],
      likes: []
    };

    setStories(prev => [newStory, ...prev]);

    try {
      await setDoc(doc(db, "stories", newStory.id), newStory);
    } catch (e) {}
  };

  const handleLikeStory = async (storyId: string) => {
    if (!currentUser) return;
    setStories(prev => prev.map(s => {
      if (s.id === storyId) {
        const storyLikes = s.likes || [];
        const liked = storyLikes.includes(currentUser.uid);
        const newLikes = liked ? storyLikes.filter(id => id !== currentUser.uid) : [...storyLikes, currentUser.uid];
        
        if (!liked && s.userId !== currentUser.uid) {
          sendNotification(s.userId, "story_reply", undefined, storyId, undefined, "liked your story!");
        }

        return { ...s, likes: newLikes };
      }
      return s;
    }));
  };

  const handleViewStory = async (storyId: string) => {
    if (!currentUser) return;
    setStories(prev => prev.map(s => {
      if (s.id === storyId) {
        const viewList = s.viewers || [];
        if (!viewList.includes(currentUser.uid)) {
          return { ...s, viewers: [...viewList, currentUser.uid] };
        }
      }
      return s;
    }));
  };

  const handleCreateHighlight = async (title: string, coverUrl: string, storyIds: string[]) => {
    if (!currentUser) return;
    const newHighlight: Highlight = {
      id: "hl_" + Math.random().toString(36).substring(2, 9),
      userId: currentUser.uid,
      title,
      coverUrl,
      storyIds
    };
    setHighlights(prev => [...prev, newHighlight]);
  };

  const handleLikeReel = async (reelId: string) => {
    if (!currentUser) return;
    setReels(prev => prev.map(r => {
      if (r.id === reelId) {
        const hasLiked = savedPosts.includes(`liked_reel_${reelId}`);
        const countDiff = hasLiked ? -1 : 1;
        
        if (hasLiked) {
          setSavedPosts(s => s.filter(x => x !== `liked_reel_${reelId}`));
        } else {
          setSavedPosts(s => [...s, `liked_reel_${reelId}`]);
          if (r.authorId !== currentUser.uid) {
            sendNotification(r.authorId, "like", undefined, undefined, undefined, "liked your reel!");
          }
        }
        return { ...r, likesCount: Math.max(0, r.likesCount + countDiff) };
      }
      return r;
    }));
  };

  // -------------------------------------------------------------
  // MESSAGING / DIRECT SYSTEM
  // -------------------------------------------------------------
  const handleSendMessage = async (chatId: string, text: string, mediaUrl?: string, mediaType?: "image" | "voice") => {
    if (!currentUser) return;

    const newMsg: Message = {
      id: "msg_" + Math.random().toString(36).substring(2, 9),
      chatId,
      senderId: currentUser.uid,
      text,
      mediaUrl,
      mediaType,
      createdAt: new Date().toISOString(),
      seen: false
    };

    setMessages(prev => [...prev, newMsg]);
    setChats(prev => prev.map(c => c.id === chatId ? {
      ...c,
      lastMessage: text || (mediaType === "image" ? "📷 Image" : "🎙️ Voice message"),
      lastMessageAt: new Date().toISOString()
    } : c));

    // Send notification to recipient
    const chat = chats.find(c => c.id === chatId);
    const recipientId = chat?.participantIds.find(id => id !== currentUser.uid);
    if (recipientId) {
      sendNotification(recipientId, "message", undefined, undefined, chatId, text || "Sent an attachment");
    }

    try {
      await setDoc(doc(db, "messages", newMsg.id), newMsg);
      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: text || (mediaType === "image" ? "📷 Image" : "🎙️ Voice message"),
        lastMessageAt: new Date().toISOString()
      });
    } catch (e) {}
  };

  const handleCreateChat = async (targetUid: string): Promise<string> => {
    if (!currentUser) return "";
    
    // Check if chat exists
    const existingChat = chats.find(c => 
      c.participantIds.includes(currentUser.uid) && c.participantIds.includes(targetUid)
    );

    if (existingChat) {
      setSelectedChatId(existingChat.id);
      return existingChat.id;
    }

    const newChatId = "chat_" + Math.random().toString(36).substring(2, 9);
    const newChat: Chat = {
      id: newChatId,
      participantIds: [currentUser.uid, targetUid],
      lastMessage: "Conversation started",
      lastMessageAt: new Date().toISOString()
    };

    setChats(prev => [newChat, ...prev]);
    setSelectedChatId(newChatId);

    try {
      await setDoc(doc(db, "chats", newChatId), newChat);
    } catch (e) {}

    return newChatId;
  };

  const handleSetTyping = (chatId: string, isTyping: boolean) => {
    if (!currentUser) return;
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        const typingState = c.typing || {};
        return {
          ...c,
          typing: { ...typingState, [currentUser.uid]: isTyping }
        };
      }
      return c;
    }));
  };

  // -------------------------------------------------------------
  // NOTIFICATIONS UTILITY
  // -------------------------------------------------------------
  const sendNotification = (
    recipientId: string, 
    type: Notification["type"], 
    postId?: string, 
    storyId?: string, 
    chatId?: string,
    customText?: string
  ) => {
    if (!currentUser) return;
    const newNotif: Notification = {
      id: "notif_" + Math.random().toString(36).substring(2, 9),
      recipientId,
      senderId: currentUser.uid,
      type,
      postId,
      storyId,
      chatId,
      createdAt: new Date().toISOString(),
      read: false,
      customText
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // -------------------------------------------------------------
  // SAFETY & MODERATION (REPORT SYSTEM)
  // -------------------------------------------------------------
  const handleReport = async (
    reportedId: string, 
    reportedType: "user" | "post" | "comment" | "reel", 
    reason: any, 
    description?: string
  ) => {
    if (!currentUser) return;

    const newReport: Report = {
      id: "report_" + Math.random().toString(36).substring(2, 9),
      reporterId: currentUser.uid,
      reportedId,
      reportedType,
      reason,
      description,
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    setReports(prev => [newReport, ...prev]);
    
    // Log admin system report trigger
    const adminLog: AdminLog = {
      id: "log_" + Math.random().toString(36).substring(2, 9),
      adminId: "system",
      action: "New Report Submitted",
      targetId: reportedId,
      timestamp: new Date().toISOString(),
      details: `Report for ${reportedType} submitted by ${currentUser.username}. Reason: ${reason}`
    };
    setAdminLogs(prev => [adminLog, ...prev]);

    try {
      await setDoc(doc(db, "reports", newReport.id), newReport);
    } catch (e) {}
  };

  // -------------------------------------------------------------
  // ADMIN PANEL CONTROLS
  // -------------------------------------------------------------
  const handleAdminAction = async (actionType: string, targetId: string, details?: string) => {
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "superadmin")) return;

    const log: AdminLog = {
      id: "log_" + Math.random().toString(36).substring(2, 9),
      adminId: currentUser.uid,
      action: actionType,
      targetId,
      timestamp: new Date().toISOString(),
      details
    };

    setAdminLogs(prev => [log, ...prev]);
  };

  const handleUpdateReportStatus = async (reportId: string, status: "Pending" | "Under Review" | "Resolved" | "Rejected") => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
    handleAdminAction("Update Report Status", reportId, `Status changed to ${status}`);
    
    try {
      await updateDoc(doc(db, "reports", reportId), { status });
    } catch (e) {}
  };

  const handleGiveVerified = async (userId: string, isVerified: boolean) => {
    setUsers(prev => prev.map(u => u.uid === userId ? { ...u, isVerified } : u));
    if (currentUser?.uid === userId) {
      setCurrentUser(prev => prev ? { ...prev, isVerified } : null);
    }
    handleAdminAction(isVerified ? "Grant Verified Badge" : "Remove Verified Badge", userId);

    try {
      await updateDoc(doc(db, "users", userId), { isVerified });
    } catch (e) {}
  };

  const handleUpdateUserRole = async (userId: string, role: "user" | "admin" | "superadmin") => {
    if (currentUser?.role !== "superadmin") return; // Super admin only!
    setUsers(prev => prev.map(u => u.uid === userId ? { ...u, role } : u));
    handleAdminAction("Change User Role", userId, `Role changed to ${role}`);

    try {
      await updateDoc(doc(db, "users", userId), { role });
    } catch (e) {}
  };

  const handleDeleteUserAccount = async (userId: string) => {
    setUsers(prev => prev.filter(u => u.uid !== userId));
    setPosts(prev => prev.filter(p => p.authorId !== userId));
    setComments(prev => prev.filter(c => c.authorId !== userId));
    handleAdminAction("Delete User Account", userId, "Permanently removed user profile and post mappings.");

    try {
      await deleteDoc(doc(db, "users", userId));
    } catch (e) {}
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        posts,
        comments,
        stories,
        highlights,
        reels,
        chats,
        messages,
        notifications,
        reports,
        adminLogs,
        savedPosts,
        followingIds,
        followerIds,
        activeTab,
        setActiveTab,
        selectedPostId,
        setSelectedPostId,
        selectedUsername,
        setSelectedUsername,
        selectedChatId,
        setSelectedChatId,
        selectedStoryUserId,
        setSelectedStoryUserId,
        selectedHighlightId,
        setSelectedHighlightId,
        handleLogin,
        handleGoogleLogin,
        handleSignup,
        handleLogout,
        handleResetPassword,
        handleUpdateProfile,
        handleDeleteAccount,
        handleLikePost,
        handleSavePost,
        handleCreatePost,
        handleDeletePost,
        handleArchivePost,
        handleCreateComment,
        handleDeleteComment,
        handleFollowUser,
        handleBlockUser,
        handleMuteUser,
        handleCreateStory,
        handleLikeStory,
        handleViewStory,
        handleCreateHighlight,
        handleLikeReel,
        handleSendMessage,
        handleCreateChat,
        handleSetTyping,
        handleReport,
        handleAdminAction,
        handleUpdateReportStatus,
        handleGiveVerified,
        handleUpdateUserRole,
        handleDeleteUserAccount,
        darkMode,
        setDarkMode,
        language,
        setLanguage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
