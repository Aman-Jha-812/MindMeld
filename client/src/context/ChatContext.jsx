import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import * as chatService from '../services/chatService';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const playNotificationSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const play = () => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    };
    if (ctx.state === 'suspended') {
      ctx.resume().then(play).catch(() => {});
    } else {
      play();
    }
  } catch (err) {
    console.error('Failed to play notification sound:', err);
  }
};

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannelState] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const pendingChannelRef = useRef(null);
  const activeChannelRef = useRef(null);
  const [socketVersion, setSocketVersion] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    activeChannelRef.current = activeChannel;
  }, [activeChannel]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token || !user) return;
    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });
    socketRef.current = socket;

    setIsConnected(false);

    socket.on('connect', () => {
      console.log('Chat socket connected');
      setIsConnected(true);
      if (pendingChannelRef.current) {
        console.log('Re-joining pending channel on connect:', pendingChannelRef.current);
        socket.emit('join_channel', { channelId: pendingChannelRef.current });
      }
      setSocketVersion((v) => v + 1);
    });

    socket.on('disconnect', (reason) => {
      console.log('Chat socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Chat socket connection error:', err.message);
      if (err.message === 'Invalid token') {
        const newToken = localStorage.getItem('accessToken');
        if (newToken) socket.auth.token = newToken;
      }
      setIsConnected(false);
    });

    socket.on('new_message', (message) => {
      console.log('Received new_message event:', message._id);
      setMessages((prev) => {
        if (prev.some((m) => (m._id || m.id) === (message._id || message.id))) {
          return prev;
        }
        return [...prev, message];
      });
    });
    socket.on('message_edited', (message) => {
      if (!message || !message._id) return;
      setMessages((prev) =>
        prev.map((msg) => (msg._id === message._id || msg.id === message._id ? { ...msg, ...message } : msg))
      );
    });
    socket.on('message_deleted', ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId && msg.id !== messageId));
    });
    socket.on('notification', (notification) => {
      console.log('Received notification event:', notification?._id);
      const notifChannelId = notification?.data?.channelId;
      const currentChannelId = activeChannelRef.current?._id || activeChannelRef.current?.id;
      if (notifChannelId && notifChannelId === currentChannelId) {
        api.put(`/notifications/read-channel/${notifChannelId}`).catch(() => {});
        return;
      }
      setUnreadCount((prev) => prev + 1);
      playNotificationSound();
      if (notification?.title) {
        toast(notification.message || notification.title, {
          icon: '🔔',
          duration: 5000,
        });
      }
    });
    setSocketVersion((v) => v + 1);
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const joinChannel = useCallback((channelId) => {
    pendingChannelRef.current = channelId;
    console.log('Joining channel:', channelId, 'socket:', !!socketRef.current);
    socketRef.current?.emit('join_channel', { channelId });
  }, []);

  const leaveChannel = useCallback((channelId) => {
    if (pendingChannelRef.current === channelId) pendingChannelRef.current = null;
    console.log('Leaving channel:', channelId);
    socketRef.current?.emit('leave_channel', { channelId });
  }, []);

  const loadChannels = useCallback(async (workspaceId) => {
    setChannels([]);
    setActiveChannelState(null);
    setMessages([]);
    setLoading(true);
    try {
      const { data } = await chatService.getChannels(workspaceId);
      setChannels(data.data || []);
    } catch (err) {
      console.error('Failed to load channels:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (workspaceId, channelId, params) => {
    setMessages([]);
    setLoading(true);
    try {
      const { data } = await chatService.getMessages(workspaceId, channelId, params);
      setMessages(data.data || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const setActiveChannel = useCallback((channel) => {
    setActiveChannelState(channel);
    setMessages([]);
  }, []);

  const sendMessage = useCallback(async (workspaceId, channelId, content, file) => {
    let fileData = null;
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const { data: uploadRes } = await api.post('/files/upload', formData);
      fileData = uploadRes.data;
    }
    const { data } = await chatService.sendMessage(workspaceId, channelId, { content, file: fileData });
    const newMessage = data.data || data.message || data;
    setMessages((prev) => {
      if (prev.some((m) => (m._id || m.id) === (newMessage._id || newMessage.id))) return prev;
      return [...prev, newMessage];
    });
    return newMessage;
  }, []);

  const addMessage = useCallback((message) => {
    setMessages((prev) => [message, ...prev]);
  }, []);

  const updateMessage = useCallback((messageId, data) => {
    setMessages((prev) =>
      prev.map((msg) => (msg._id === messageId || msg.id === messageId ? { ...msg, ...data } : msg)),
    );
  }, []);

  const removeMessage = useCallback((messageId) => {
    setMessages((prev) => prev.filter((msg) => msg._id !== messageId && msg.id !== messageId));
  }, []);

  const setTyping = useCallback((userId, channelId) => {
    setTypingUsers((prev) => ({
      ...prev,
      [channelId]: [...new Set([...(prev[channelId] || []), userId])],
    }));
  }, []);

  const clearTyping = useCallback((userId, channelId) => {
    setTypingUsers((prev) => {
      const users = (prev[channelId] || []).filter((id) => id !== userId);
      if (users.length === 0) {
        const { [channelId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [channelId]: users };
    });
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadCount(data.data?.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  const markChannelRead = useCallback(async (channelId) => {
    if (!channelId) return;
    try {
      await api.put(`/notifications/read-channel/${channelId}`);
      refreshUnreadCount();
    } catch (err) {
      console.error('Failed to mark channel as read:', err);
    }
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (activeChannel) {
      markChannelRead(activeChannel._id || activeChannel.id);
    }
  }, [activeChannel, markChannelRead]);

  useEffect(() => {
    if (user) {
      refreshUnreadCount();
    }
  }, [user, refreshUnreadCount]);

  const value = {
    channels,
    activeChannel,
    messages,
    loading,
    typingUsers,
    isConnected,
    socketVersion,
    unreadCount,
    refreshUnreadCount,
    markChannelRead,
    setActiveChannel,
    loadMessages,
    sendMessage,
    loadChannels,
    addMessage,
    updateMessage,
    removeMessage,
    setMessages,
    joinChannel,
    leaveChannel,
    setTyping,
    clearTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;
