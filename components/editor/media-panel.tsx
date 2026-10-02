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
    }
