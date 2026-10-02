'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader } from 'lucide-react';
import { EditorHeader } from '@/components/editor/header';
import { MediaPanel } from '@/components/editor/media-panel';
import { VideoPreview } from '@/components/editor/video-preview';
import { AIChat } from '@/components/editor/ai-chat';
import { Timeline } from '@/components/editor/timeline';
import { Project, MediaAsset, EditingPlan, ChatMessage } from '@/lib/types';
import { apiGet, apiPost } from '@/lib/api';
import { useEditorStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function EditorPage() {
  const params = useParams();
  const projectId = params.id as string;

  // Global state
  const {
    currentProject,
    setCurrentProject,
    mediaAssets,
    setMediaAssets,
    addMediaAsset,
    removeMediaAsset,
    editingPlan,
    setEditingPlan,
    isLoading,
    setIsLoading,
    error,
    setError,
  } = useEditorStore();

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Load project and media on mount
  useEffect(() => {
    const loadProject = async () => {
      setIsLoading(true);
      try {
        // Load project
        const projectRes = await apiGet<Project>(`/api/projects/${projectId}`);
        if (projectRes.data) {
          setCurrentProject(projectRes.data);
        } else {
          setError('Failed to load project');
        }

        // Load media assets
        const mediaRes = await apiGet<MediaAsset[]>(`/api/projects/${projectId}/upload`);
        if (mediaRes.data) {
          setMediaAssets(mediaRes.data);
          if (mediaRes.data.length > 0) {
            setSelectedAssetId(mediaRes.data[0].id);
          }
        }
      } catch (err) {
        setError('Failed to load editor');
        toast.error('Failed to load editor');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      loadProject();
    }
  }, [projectId, setCurrentProject, setMediaAssets, setIsLoading, setError]);

  const handleGenerateEdit = async () => {
    if (mediaAssets.length === 0) {
      toast.error('Upload media first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiPost<{ plan: EditingPlan }>(
        `/api/projects/${projectId}/ai-edit`,
        {
          userInstruction: 'Create an engaging edit with the best moments',
          mediaIds: mediaAssets.map((a) => a.id),
          aspectRatio: currentProject?.aspect_ratio || '9:16',
          targetDuration: 30,
          style: 'dynamic and engaging',
        }
      );

      if (response.data?.plan) {
        setEditingPlan(response.data.plan);
        toast.success('Edit generated! Check the timeline.');
      }
    } catch (err) {
      toast.error('Failed to generate edit');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !currentProject) {
    return (
      <div className="w-full h-screen bg-qc-bg flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-qc-primary mx-auto mb-4" />
          <p className="text-gray-400">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-qc-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-qc-primary rounded-lg hover:bg-opacity-90"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  const selectedAsset = mediaAssets.find((a) => a.id === selectedAssetId);

  return (
    <div className="w-full h-screen bg-qc-bg flex flex-col overflow-hidden">
      <EditorHeader projectName={currentProject?.name || 'Untitled'} projectId={projectId} />

      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: Media */}
        <div className="w-64 border-r border-qc-border overflow-y-auto">
          <MediaPanel
            assets={mediaAssets}
            projectId={projectId}
            onAssetAdded={(asset) => {
              addMediaAsset(asset);
              setSelectedAssetId(asset.id);
              toast.success('Asset added');
            }}
            onAssetRemoved={(id) => {
              removeMediaAsset(id);
              if (selectedAssetId === id) {
                setSelectedAssetId(mediaAssets[0]?.id || null);
              }
              toast.success('Asset removed');
            }}
          />
        </div>

        {/* Center: Preview and Timeline */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Preview */}
          <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
            <VideoPreview src={selectedAsset?.storage_url} />
          </div>

          {/* Timeline */}
          <div className="h-48 border-t border-qc-border overflow-hidden">
            <Timeline editingPlan={editingPlan} />
          </div>
        </div>

        {/* Right panel: AI Chat */}
        <div className="w-80 border-l border-qc-border flex flex-col overflow-hidden">
          <AIChat projectId={projectId} />
        </div>
      </div>

      {/* Quick action button */}
      {mediaAssets.length > 0 && !editingPlan && (
        <div className="absolute bottom-6 left-6 z-50">
          <button
            onClick={handleGenerateEdit}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-qc-primary to-qc-secondary rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <span>✨ Generate AI Edit</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
            }
