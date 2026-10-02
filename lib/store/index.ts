import { create } from 'zustand';
import { Project, MediaAsset, EditingPlan, ChatMessage } from '@/lib/types';

interface EditorState {
  // Projects
  currentProject: Project | null;
  projects: Project[];
  setCurrentProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;
  updateProject: (project: Project) => void;

  // Media
  mediaAssets: MediaAsset[];
  setMediaAssets: (assets: MediaAsset[]) => void;
  addMediaAsset: (asset: MediaAsset) => void;
  updateMediaAsset: (asset: MediaAsset) => void;
  removeMediaAsset: (assetId: string) => void;

  // Editing
  editingPlan: EditingPlan | null;
  setEditingPlan: (plan: EditingPlan | null) => void;
  editingHistory: EditingPlan[];
  addToEditingHistory: (plan: EditingPlan) => void;

  // Chat
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;

  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  uploadProgress: Record<string, number>;
  setUploadProgress: (progress: Record<string, number>) => void;
  updateUploadProgress: (fileId: string, progress: number) => void;

  // UI layout
  showMediaPanel: boolean;
  setShowMediaPanel: (show: boolean) => void;
  showAIChat: boolean;
  setShowAIChat: (show: boolean) => void;
  showTimeline: boolean;
  setShowTimeline: (show: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  // Projects
  currentProject: null,
  projects: [],
  setCurrentProject: (project) => set({ currentProject: project }),
  setProjects: (projects) => set({ projects }),
  updateProject: (project) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === project.id ? project : p)),
      currentProject: state.currentProject?.id === project.id ? project : state.currentProject,
    })),

  // Media
  mediaAssets: [],
  setMediaAssets: (assets) => set({ mediaAssets: assets }),
  addMediaAsset: (asset) => set((state) => ({ mediaAssets: [...state.mediaAssets, asset] })),
  updateMediaAsset: (asset) =>
    set((state) => ({
      mediaAssets: state.mediaAssets.map((a) => (a.id === asset.id ? asset : a)),
    })),
  removeMediaAsset: (assetId) =>
    set((state) => ({
      mediaAssets: state.mediaAssets.filter((a) => a.id !== assetId),
    })),

  // Editing
  editingPlan: null,
  setEditingPlan: (plan) => set({ editingPlan: plan }),
  editingHistory: [],
  addToEditingHistory: (plan) =>
    set((state) => ({
      editingHistory: [...state.editingHistory, plan],
    })),

  // Chat
  chatMessages: [],
  setChatMessages: (messages) => set({ chatMessages: messages }),
  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),

  // UI state
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),
  uploadProgress: {},
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  updateUploadProgress: (fileId, progress) =>
    set((state) => ({
      uploadProgress: {
        ...state.uploadProgress,
        [fileId]: progress,
      },
    })),

  // UI layout
  showMediaPanel: true,
  setShowMediaPanel: (show) => set({ showMediaPanel: show }),
  showAIChat: true,
  setShowAIChat: (show) => set({ showAIChat: show }),
  showTimeline: true,
  setShowTimeline: (show) => set({ showTimeline: show }),
}));

// Auth store
interface AuthState {
  user: { id: string; email: string } | null;
  isAuthenticated: boolean;
  setUser: (user: { id: string; email: string } | null) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user }),
  setIsAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
}));
