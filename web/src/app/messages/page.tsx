"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { 
  MessageCircle, Send, ArrowLeft, MoreVertical, 
  Ban, Flag, Trash2, AlertCircle, Check, X
} from "lucide-react";

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isFromMe: boolean;
  } | null;
  updatedAt: string;
  isBlocked: boolean;
}

interface Message {
  id: string;
  content: string;
  isFromMe: boolean;
  createdAt: string;
}

interface ConversationDetails {
  id: string;
  otherUser: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  isBlocked: boolean;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedConvId = searchParams.get("conversation");
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/conversations");
      if (!res.ok) throw new Error("Failed to fetch conversations");
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const res = await fetch(`/api/messages/conversations/${conversationId}`);
      if (!res.ok) {
        if (res.status === 403) {
          setError("You don't have access to this conversation");
          return;
        }
        throw new Error("Failed to fetch messages");
      }
      const data = await res.json();
      setSelectedConversation(data.conversation);
      setMessages(data.messages || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages");
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchConversations();
      setLoading(false);
    }
  }, [status, fetchConversations]);

  useEffect(() => {
    if (selectedConvId && status === "authenticated") {
      fetchMessages(selectedConvId);
    } else {
      setSelectedConversation(null);
      setMessages([]);
    }
  }, [selectedConvId, status, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!selectedConvId || !status || status !== "authenticated") return;
    
    const interval = setInterval(() => {
      fetchMessages(selectedConvId);
      fetchConversations();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [selectedConvId, status, fetchMessages, fetchConversations]);

  const selectConversation = (convId: string) => {
    router.push(`/messages?conversation=${convId}`);
  };

  const goBackToList = () => {
    router.push("/messages");
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvId || sendingMessage) return;

    setSendingMessage(true);
    try {
      const res = await fetch(`/api/messages/conversations/${selectedConvId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      const data = await res.json();
      setMessages(prev => [...prev, data.message]);
      setNewMessage("");
      fetchConversations();
    } catch (err: any) {
      setError(err.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleBlock = async () => {
    if (!selectedConversation) return;
    
    const isCurrentlyBlocked = selectedConversation.isBlocked;
    const endpoint = "/api/messages/block";
    const method = isCurrentlyBlocked ? "DELETE" : "POST";
    
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: selectedConversation.otherUser.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update block status");
      }

      setSelectedConversation(prev => prev ? { ...prev, isBlocked: !isCurrentlyBlocked } : null);
      fetchConversations();
      setShowMenu(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !reportReason.trim()) return;

    setSubmittingReport(true);
    try {
      const res = await fetch("/api/messages/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedUserId: selectedConversation.otherUser.id,
          conversationId: selectedConvId,
          reason: reportReason.trim(),
          description: reportDescription.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit report");
      }

      setShowReportModal(false);
      setReportReason("");
      setReportDescription("");
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingReport(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete message");
      }

      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="mt-4 text-[var(--muted)]">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-[var(--surface)] rounded-2xl shadow-lg border border-[var(--border)] overflow-hidden" style={{ height: "calc(100vh - 180px)", minHeight: "500px" }}>
          <div className="flex h-full">
            {/* Conversation List */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-[var(--border)] flex flex-col ${selectedConvId ? "hidden md:flex" : "flex"}`}>
              <div className="p-4 border-b border-[var(--border)]">
                <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-emerald-500" />
                  Messages
                </h1>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <MessageCircle className="w-16 h-16 text-[var(--muted)] mb-4" />
                    <p className="text-[var(--muted)] text-lg font-medium">No messages yet</p>
                    <p className="text-[var(--muted)] text-sm mt-2">
                      Start a conversation by clicking "Message" on someone's profile or post
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => selectConversation(conv.id)}
                        className={`w-full p-4 text-left hover:bg-[var(--surface2)] transition-colors ${
                          selectedConvId === conv.id ? "bg-[var(--surface2)]" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                            {conv.otherUser.avatarUrl ? (
                              <img 
                                src={conv.otherUser.avatarUrl} 
                                alt={conv.otherUser.displayName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                                {conv.otherUser.displayName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-[var(--text)] truncate">
                                {conv.otherUser.displayName}
                              </p>
                              {conv.lastMessage && (
                                <span className="text-xs text-[var(--muted)]">
                                  {formatTime(conv.lastMessage.createdAt)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[var(--muted)] truncate">
                              @{conv.otherUser.username}
                              {conv.isBlocked && (
                                <span className="ml-2 text-red-500">(Blocked)</span>
                              )}
                            </p>
                            {conv.lastMessage && (
                              <p className="text-sm text-[var(--muted)] truncate mt-1">
                                {conv.lastMessage.isFromMe ? "You: " : ""}
                                {conv.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Message Thread */}
            <div className={`flex-1 flex flex-col ${selectedConvId ? "flex" : "hidden md:flex"}`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={goBackToList}
                        className="md:hidden p-2 hover:bg-[var(--surface2)] rounded-lg transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5 text-[var(--text)]" />
                      </button>
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        {selectedConversation.otherUser.avatarUrl ? (
                          <img 
                            src={selectedConversation.otherUser.avatarUrl} 
                            alt={selectedConversation.otherUser.displayName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {selectedConversation.otherUser.displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text)]">
                          {selectedConversation.otherUser.displayName}
                        </p>
                        <p className="text-sm text-[var(--muted)]">
                          @{selectedConversation.otherUser.username}
                        </p>
                      </div>
                    </div>
                    
                    {/* Actions Menu */}
                    <div className="relative" ref={menuRef}>
                      <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 hover:bg-[var(--surface2)] rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-[var(--text)]" />
                      </button>
                      
                      {showMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg z-50">
                          <button
                            onClick={handleBlock}
                            className="w-full px-4 py-3 text-left hover:bg-[var(--surface2)] flex items-center gap-2 text-[var(--text)]"
                          >
                            <Ban className="w-4 h-4" />
                            {selectedConversation.isBlocked ? "Unblock User" : "Block User"}
                          </button>
                          <button
                            onClick={() => {
                              setShowReportModal(true);
                              setShowMenu(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-[var(--surface2)] flex items-center gap-2 text-red-500"
                          >
                            <Flag className="w-4 h-4" />
                            Report User
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {selectedConversation.isBlocked && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-center text-yellow-700 dark:text-yellow-400">
                        <Ban className="w-5 h-5 inline-block mr-2" />
                        This conversation is blocked. Unblock to send messages.
                      </div>
                    )}
                    
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-[var(--muted)]">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isFromMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`group max-w-[75%] rounded-2xl px-4 py-2 ${
                              message.isFromMe
                                ? "bg-emerald-500 text-white rounded-br-md"
                                : "bg-[var(--surface2)] text-[var(--text)] rounded-bl-md"
                            }`}
                          >
                            <p className="break-words whitespace-pre-wrap">{message.content}</p>
                            <div className={`flex items-center gap-2 mt-1 ${message.isFromMe ? "justify-end" : "justify-start"}`}>
                              <span className={`text-xs ${message.isFromMe ? "text-emerald-100" : "text-[var(--muted)]"}`}>
                                {formatTime(message.createdAt)}
                              </span>
                              {message.isFromMe && (
                                <button
                                  onClick={() => deleteMessage(message.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-emerald-600 rounded"
                                  title="Delete message"
                                >
                                  <Trash2 className="w-3 h-3 text-emerald-100" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={sendMessage} className="p-4 border-t border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={selectedConversation.isBlocked ? "Unblock user to send messages" : "Type a message..."}
                        disabled={selectedConversation.isBlocked || sendingMessage}
                        className="flex-1 px-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                        maxLength={5000}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || selectedConversation.isBlocked || sendingMessage}
                        className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
                        style={{ color: "#ffffff" }}
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <MessageCircle className="w-20 h-20 text-[var(--muted)] mb-4" />
                  <h2 className="text-xl font-semibold text-[var(--text)] mb-2">Select a conversation</h2>
                  <p className="text-[var(--muted)]">
                    Choose a conversation from the list or start a new one
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--text)]">Report User</h3>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason("");
                  setReportDescription("");
                }}
                className="p-2 hover:bg-[var(--surface2)] rounded-lg"
              >
                <X className="w-5 h-5 text-[var(--text)]" />
              </button>
            </div>
            
            <form onSubmit={handleReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Reason for report *
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="Harassment">Harassment</option>
                  <option value="Spam">Spam</option>
                  <option value="Inappropriate content">Inappropriate content</option>
                  <option value="Threats or violence">Threats or violence</option>
                  <option value="Scam or fraud">Scam or fraud</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Provide more context about this report..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  maxLength={500}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason("");
                    setReportDescription("");
                  }}
                  className="flex-1 px-4 py-3 border border-[var(--border)] rounded-xl text-[var(--text)] hover:bg-[var(--surface2)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!reportReason || submittingReport}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                  style={{ color: "#ffffff" }}
                >
                  {submittingReport ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Flag className="w-4 h-4" />
                      Submit Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
