"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  Search, UserPlus, MessageCircle, Send, ArrowLeft, 
  Check, X, Clock, User, Sparkles
} from "lucide-react";
import toast from "react-hot-toast";

type TabType = "search" | "pending" | "conversations";

interface SearchUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  connectionStatus: "none" | "pending_sent" | "pending_received" | "connected";
}

interface PendingRequest {
  id: string;
  message?: string;
  createdAt: string;
  sender?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  receiver?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
}

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

function AvatarPlaceholder({ name, size = "md" }: { name?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14"
  };
  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-7 h-7"
  };
  
  const initial = name?.charAt(0)?.toUpperCase() || "";
  const colors = [
    "from-emerald-400 to-teal-500",
    "from-blue-400 to-indigo-500",
    "from-purple-400 to-pink-500",
    "from-amber-400 to-orange-500",
    "from-cyan-400 to-blue-500",
  ];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  
  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center shadow-lg ring-2 ring-white/20`}>
      {initial ? (
        <span className="text-white font-bold text-lg drop-shadow-sm">{initial}</span>
      ) : (
        <User className={`${iconSizes[size]} text-white/90`} />
      )}
    </div>
  );
}

function MessagesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<TabType>("conversations");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [pendingReceived, setPendingReceived] = useState<PendingRequest[]>([]);
  const [pendingSent, setPendingSent] = useState<PendingRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectionMessage, setConnectionMessage] = useState("");
  const [showConnectionModal, setShowConnectionModal] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<{id: string; username: string; displayName: string; avatarUrl?: string} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchConversations();
      fetchPendingRequests();
    }
  }, [status]);

  useEffect(() => {
    const convId = searchParams.get("conversation");
    if (convId) {
      setSelectedConversation(convId);
      fetchMessages(convId);
    }
  }, [searchParams]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/messages/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const [receivedRes, sentRes] = await Promise.all([
        fetch("/api/connections?type=pending-received"),
        fetch("/api/connections?type=pending-sent"),
      ]);

      if (receivedRes.ok) {
        const data = await receivedRes.json();
        setPendingReceived(data.requests || []);
      }
      if (sentRes.ok) {
        const data = await sentRes.json();
        setPendingSent(data.requests || []);
      }
    } catch (err) {
      console.error("Error fetching pending requests:", err);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/messages/conversations/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setOtherUser(data.conversation?.otherUser || null);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[var(--primary)]/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-[var(--primary)] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)]/30 to-[var(--bg-primary)]">
      <div className="container max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-emerald-600 shadow-lg shadow-[var(--primary)]/20">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Messages</h1>
            <p className="text-[var(--text-muted)] text-sm">Connect and chat with your community</p>
          </div>
        </div>
        <p className="text-[var(--text-secondary)]">Messages feature is loading...</p>
      </div>
    </div>
  );
}

export default function MessagesClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
