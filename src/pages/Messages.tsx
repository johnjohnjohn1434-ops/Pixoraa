/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send as SendIcon, Image as ImageIcon, CheckCheck as ChecksIcon, 
  Trash2 as TrashIcon, Mic as VoiceIcon, ShieldAlert as ReportIcon 
} from "lucide-react";
import { Chat, Message, User } from "../types";

export const Messages: React.FC = () => {
  const { 
    currentUser, chats, messages, users, handleSendMessage, 
    handleCreateChat, handleSetTyping, selectedChatId, setSelectedChatId 
  } = useApp();

  const [activeMessageText, setActiveMessageText] = useState("");
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [selectedUserForChat, setSelectedUserForChat] = useState<User | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChatId]);

  // Typing debounce simulator
  useEffect(() => {
    if (!selectedChatId || !currentUser) return;

    if (activeMessageText.trim().length > 0) {
      if (!isTypingLocal) {
        setIsTypingLocal(true);
        handleSetTyping(selectedChatId, true);
      }
      const delay = setTimeout(() => {
        setIsTypingLocal(false);
        handleSetTyping(selectedChatId, false);
      }, 2500);
      return () => clearTimeout(delay);
    } else {
      if (isTypingLocal) {
        setIsTypingLocal(false);
        handleSetTyping(selectedChatId, false);
      }
    }
  }, [activeMessageText]);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Please authenticate to access direct threads.</p>
      </div>
    );
  }

  const activeChat = chats.find(c => c.id === selectedChatId);
  const chatMessages = messages.filter(m => m.chatId === selectedChatId);

  // Get recipient profile info
  const getRecipientUser = (chat: Chat) => {
    const rId = chat.participantIds.find(id => id !== currentUser.uid);
    return users.find(u => u.uid === rId) || {
      uid: "unknown",
      username: "user",
      displayName: "Creator",
      photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      status: "offline"
    };
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatId) return;

    if (activeMessageText.trim()) {
      handleSendMessage(selectedChatId, activeMessageText.trim());
      setActiveMessageText("");
    } else if (mediaUrlInput.trim()) {
      handleSendMessage(selectedChatId, "📷 Image shared", mediaUrlInput.trim(), "image");
      setMediaUrlInput("");
      setShowMediaInput(false);
    }
  };

  const handleVoiceMemoMock = () => {
    if (!selectedChatId) return;
    handleSendMessage(selectedChatId, "🎙️ Shared a voice memo", "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg", "voice");
    alert("Voice memo uploaded & shared! (Simulated)");
  };

  const startNewChatThread = async (userId: string) => {
    const cid = await handleCreateChat(userId);
    setSelectedChatId(cid);
    setShowNewChatModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto h-[90vh] py-4 px-4 pb-24 md:pb-12 flex space-x-4">
      
      {/* LEFT: CHATS DIRECTORY SIDEBAR */}
      <div className={`w-full md:w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-sm transition-colors ${selectedChatId ? "hidden md:flex" : "flex"}`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-50 dark:border-slate-800/60 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">Messages</h2>
          <button 
            onClick={() => setShowNewChatModal(true)}
            className="text-xs font-bold text-indigo-500 hover:text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-lg"
          >
            + New
          </button>
        </div>

        {/* Chats Roll List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.filter(c => c.participantIds.includes(currentUser.uid)).length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-xs text-slate-400 dark:text-slate-500">No active conversations. Start a chat by clicking New!</p>
            </div>
          ) : (
            chats
              .filter(c => c.participantIds.includes(currentUser.uid))
              .map(chat => {
                const recipient = getRecipientUser(chat);
                const isSelected = chat.id === selectedChatId;
                const typingObj = chat.typing || {};
                const isTyping = typingObj[recipient.uid];

                return (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition-colors ${
                      isSelected 
                        ? "bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800" 
                        : "hover:bg-slate-50/50 dark:hover:bg-slate-850/40"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img src={recipient.photoURL} className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-800" />
                      {recipient.status === "online" && (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                      )}
                    </div>

                    <div className="flex-1 truncate">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{recipient.displayName}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500">{chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isTyping ? "text-indigo-500 font-extrabold" : "text-slate-400 dark:text-slate-500"}`}>
                        {isTyping ? "Typing..." : chat.lastMessage || "Click to message"}
                      </p>
                    </div>
                  </button>
                );
              })
          )}
        </div>
      </div>

      {/* RIGHT: CONVERSATION PANEL ACTIVE CHAT */}
      <div className={`flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-sm transition-colors ${!selectedChatId ? "hidden md:flex items-center justify-center" : "flex"}`}>
        {activeChat ? (
          <>
            {/* Conversation Header */}
            {(() => {
              const rec = getRecipientUser(activeChat);
              const isTyping = activeChat.typing?.[rec.uid];
              return (
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/10">
                  <div className="flex items-center space-x-3.5">
                    <button 
                      onClick={() => setSelectedChatId(null)}
                      className="md:hidden p-1 mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <ChecksIcon size={20} className="rotate-180" />
                    </button>
                    <img src={rec.photoURL} className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-slate-800" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">{rec.displayName}</h3>
                      <span className={`text-[9px] flex items-center space-x-1 ${isTyping ? "text-indigo-500 font-black" : "text-slate-400 dark:text-slate-500"}`}>
                        {isTyping ? (
                          <span>typing...</span>
                        ) : (
                          <>
                            <span className={`h-1.5 w-1.5 rounded-full ${rec.status === "online" ? "bg-emerald-500" : "bg-slate-300"}`} />
                            <span>{rec.status === "online" ? "Active Now" : "Offline"}</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => alert(`Reporting DM stream of ${rec.username} for safety triage.`)}
                    className="p-1.5 text-slate-400 hover:text-rose-500"
                    title="Report Chat"
                  >
                    <ReportIcon size={18} />
                  </button>
                </div>
              );
            })()}

            {/* Conversation Messages Box */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {chatMessages.map(msg => {
                const isMine = msg.senderId === currentUser.uid;
                return (
                  <div 
                    key={msg.id} 
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] space-y-1 ${isMine ? "text-right" : ""}`}>
                      {/* Media bubble */}
                      {msg.mediaUrl && (
                        <div className="rounded-2xl overflow-hidden max-h-48 border border-slate-100 dark:border-slate-800">
                          {msg.mediaType === "voice" ? (
                            <audio src={msg.mediaUrl} controls className="p-1" />
                          ) : (
                            <img src={msg.mediaUrl} className="object-cover w-full h-full" />
                          )}
                        </div>
                      )}

                      {/* Text Bubble */}
                      {msg.text && (
                        <div className={`px-4 py-2.5 rounded-2xl text-xs font-medium inline-block text-left ${
                          isMine 
                            ? "bg-indigo-500 text-white rounded-tr-none" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none"
                        }`}>
                          {msg.text}
                        </div>
                      )}

                      {/* Info Row (Timestamp / double check status) */}
                      <div className="flex items-center justify-end space-x-1 text-[8px] text-slate-400 dark:text-slate-500 pr-1">
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMine && <ChecksIcon size={10} className="text-indigo-400" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* MESSAGE ATTACHMENT BOX PREVIEW INPUT */}
            <AnimatePresence>
              {showMediaInput && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20"
                >
                  <div className="flex items-center space-x-2">
                    <input 
                      type="url" 
                      placeholder="Paste image attachment URL..."
                      value={mediaUrlInput}
                      onChange={(e) => setMediaUrlInput(e.target.value)}
                      className="flex-1 text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none text-slate-800 dark:text-slate-100"
                    />
                    <button 
                      onClick={handleSend}
                      className="px-3.5 py-2 bg-indigo-500 text-white rounded-xl text-xs font-bold"
                    >
                      Attach
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Conversation Footer Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-3.5 bg-white dark:bg-slate-900">
              <button 
                type="button"
                onClick={() => setShowMediaInput(!showMediaInput)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ImageIcon size={20} />
              </button>

              <button 
                type="button"
                onClick={handleVoiceMemoMock}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <VoiceIcon size={20} />
              </button>

              <input 
                type="text"
                placeholder="Message..."
                value={activeMessageText}
                onChange={(e) => setActiveMessageText(e.target.value)}
                className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/50 border-0 focus:ring-1 focus:ring-indigo-500 rounded-xl dark:text-slate-100 outline-none"
              />

              <button 
                type="submit"
                disabled={!activeMessageText.trim() && !mediaUrlInput.trim()}
                className="text-indigo-500 hover:text-indigo-600 disabled:opacity-40 p-1.5"
              >
                <SendIcon size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-24 space-y-2">
            <div className="inline-flex h-12 w-12 bg-indigo-50 dark:bg-indigo-950/30 rounded-full items-center justify-center text-indigo-500 mb-2">
              <SendIcon size={22} className="rotate-45" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-250">Your Direct Messages</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">Click any existing conversation on the left, or search for other creators to start chat rooms.</p>
          </div>
        )}
      </div>

      {/* START CHAT POPUP DIALOG */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 w-full max-w-sm shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Select Creator to Chat</h3>
              <button onClick={() => setShowNewChatModal(false)} className="p-1">
                <checks className="text-slate-400" />
                <span className="text-xs font-bold text-slate-400">Close</span>
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {users.filter(u => u.uid !== currentUser.uid).map(user => (
                <button
                  key={user.uid}
                  onClick={() => startNewChatThread(user.uid)}
                  className="w-full flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 text-left"
                >
                  <img src={user.photoURL} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{user.displayName}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">@{user.username}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
