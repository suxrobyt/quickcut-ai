'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, X, Loader, Plus, Trash2 } from 'lucide-react';
import { MediaAsset } from '@/lib/types';
import { uploadFile } from '@/lib/api';
import toast from 'react-hot-toast';

interface MediaPanelProps {
  assets: MediaAsset[];
  projectId: string;
  onAssetAdded?: (asset: MediaAsset) => void;
  onAssetRemoved?: (assetId: string) => void;
}

export function MediaPanel({
  assets,
  projectId,
  onAssetAdded,
  onAssetRemoved,
}: MediaPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    setUploading(true);

    for (const file of fileArray) {
      try {
        const fileId = file.name;
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

        const result = await uploadFile(projectId, file, (progress) => {
          setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));
        });

        // Create asset object
        const newAsset: MediaAsset = {
          id: fileId,
          project_id: projectId,
          file_name: file.name,
          type: file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image',
          mime_type: file.type,
          file_size: file.size,
          thumbnail_url: result.url,
          storage_url: result.url,
          status: 'ready',
          created_at: new Date().toISOString(),
        };

        onAssetAdded?.(newAsset);

        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    fileInputRef.current!.value = '';
  };

  const handleRemoveAsset = (assetId: string) => {
    onAssetRemoved?.(assetId);
  };

  return (
    <div className="flex flex-col h-full bg-qc-panel">
      {/* Header */}
      <div className="px-4 py-4 border-b border-qc-border">
        <h3 className="font-semibold mb-2">Media Assets</h3>
        <p className="text-xs text-gray-400">{assets.length} files</p>
      </div>

      {/* Upload area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="m-4 p-4 border-2 border-dashed border-qc-border rounded-lg hover:border-qc-primary transition cursor-pointer bg-qc-bg bg-opacity-50"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*,image/*,audio/*"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center justify-center gap-2 py-6 disabled:opacity-50"
        >
          {uploading ? (
            <Loader className="w-6 h-6 animate-spin text-qc-primary" />
          ) : (
            <Upload className="w-6 h-6 text-qc-primary" />
          )}
          <span className="text-sm font-medium">
            {uploading ? 'Uploading...' : 'Drop or click to upload'}
          </span>
          <span className="text-xs text-gray-400">Video, image, or audio</span>
        </button>
      </div>

      {/* Assets list */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2">
        {assets.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No media yet</p>
        ) : (
          assets.map((asset) => (
            <div
              key={asset.id}
              className="p-3 bg-qc-bg rounded-lg border border-qc-border hover:border-qc-primary transition group cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-qc-primary to-qc-secondary opacity-20 rounded mb-2 flex items-center justify-center text-xs">
                {asset.type}
              </div>

              {/* Info */}
              <h4 className="text-sm font-medium truncate">{asset.file_name}</h4>
              <p className="text-xs text-gray-400 truncate">
                {asset.type} • {(asset.file_size / 1024 / 1024).toFixed(1)}MB
              </p>

              {/* Progress */}
              {uploadProgress[asset.id] !== undefined && (
                <div className="mt-2 w-full bg-qc-border rounded h-1 overflow-hidden">
                  <div
                    className="h-full bg-qc-primary transition-all"
                    style={{ width: `${uploadProgress[asset.id]}%` }}
                  />
                </div>
              )}

              {/* Delete button */}
              <button
                onClick={() => handleRemoveAsset(asset.id)}
                className="mt-2 w-full p-2 bg-red-500 bg-opacity-10 hover:bg-opacity-20 text-red-400 rounded text-xs font-medium flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 className="w-3 h-3" />
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
                     }
