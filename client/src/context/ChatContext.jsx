import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import * as chatService from '../services/chatService';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannelState] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const socketRef = useRef(null);
  const [socketVersion, setSocketVersion] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token || !user) return;
    const socket = io(import.meta.env.VITE_API_URL, { auth: { token }, transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.on('new_message', (message) => {
      setMessages((prev) => [...prev, message]);
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
    setSocketVersion((v) => v + 1);
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const joinChannel = useCallback((channelId) => {
    socketRef.current?.emit('join_channel', { channelId });
  }, []);

  const leaveChannel = useCallback((channelId) => {
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
    setMessages((prev) => [...prev, newMessage]);
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

  const value = {
    channels,
    activeChannel,
    messages,
    loading,
    typingUsers,
    socketVersion,
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
