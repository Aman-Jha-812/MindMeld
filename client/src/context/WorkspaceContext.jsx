import { createContext, useContext, useState, useCallback } from 'react';
import * as workspaceService from '../services/workspaceService';

const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadWorkspaces = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await workspaceService.getWorkspaces();
      setWorkspaces(data.data || []);
    } catch (err) {
      console.error('Failed to load workspaces:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWorkspaceById = useCallback(async (id) => {
    setActiveWorkspace(null);
    setMembers([]);
    setLoading(true);
    try {
      const { data } = await workspaceService.getWorkspaceById(id);
      const workspace = data.data;
      setActiveWorkspace(workspace);
      return workspace;
    } catch (err) {
      console.error('Failed to load workspace:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createWorkspace = useCallback(async (formData) => {
    try {
      const { data } = await workspaceService.createWorkspace(formData);
      const workspace = data.data;
      setWorkspaces((prev) => [...prev, workspace]);
      return workspace;
    } catch (err) {
      console.error('Failed to create workspace:', err);
      throw err;
    }
  }, []);

  const updateWorkspace = useCallback(async (id, formData) => {
    try {
      const { data } = await workspaceService.updateWorkspace(id, formData);
      const updated = data.data;
      setWorkspaces((prev) => prev.map((w) => (w._id === id || w.id === id ? { ...w, ...updated } : w)));
      if (activeWorkspace && (activeWorkspace._id === id || activeWorkspace.id === id)) {
        setActiveWorkspace((prev) => (prev ? { ...prev, ...updated } : null));
      }
      return updated;
    } catch (err) {
      console.error('Failed to update workspace:', err);
      throw err;
    }
  }, [activeWorkspace]);

  const deleteWorkspace = useCallback(async (id) => {
    try {
      await workspaceService.deleteWorkspace(id);
      setWorkspaces((prev) => prev.filter((w) => w._id !== id && w.id !== id));
      if (activeWorkspace && (activeWorkspace._id === id || activeWorkspace.id === id)) {
        setActiveWorkspace(null);
      }
    } catch (err) {
      console.error('Failed to delete workspace:', err);
      throw err;
    }
  }, [activeWorkspace]);

  const inviteMember = useCallback(async (id, email) => {
    try {
      const { data } = await workspaceService.inviteMember(id, { email });
      return data;
    } catch (err) {
      console.error('Failed to invite member:', err);
      throw err;
    }
  }, []);

  const removeMember = useCallback(async (workspaceId, memberId) => {
    try {
      await workspaceService.removeMember(workspaceId, memberId);
      setMembers((prev) => prev.filter((m) => m._id !== memberId && m.id !== memberId));
    } catch (err) {
      console.error('Failed to remove member:', err);
      throw err;
    }
  }, []);

  const leaveWorkspace = useCallback(async (id) => {
    try {
      await workspaceService.leaveWorkspace(id);
      setWorkspaces((prev) => prev.filter((w) => w._id !== id && w.id !== id));
      if (activeWorkspace && (activeWorkspace._id === id || activeWorkspace.id === id)) {
        setActiveWorkspace(null);
      }
    } catch (err) {
      console.error('Failed to leave workspace:', err);
      throw err;
    }
  }, [activeWorkspace]);

  const loadMembers = useCallback(async (workspaceId) => {
    setMembers([]);
    try {
      const { data } = await workspaceService.getMembers(workspaceId);
      setMembers(data.data || []);
    } catch (err) {
      console.error('Failed to load members:', err);
      throw err;
    }
  }, []);

  const value = {
    workspaces,
    activeWorkspace,
    members,
    loading,
    setActiveWorkspace,
    loadWorkspaces,
    loadWorkspaceById,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    inviteMember,
    removeMember,
    leaveWorkspace,
    loadMembers,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export default WorkspaceContext;
