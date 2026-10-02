'use client';

import { useState } from 'react';
import { Save, Download, Settings, ChevronDown, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface EditorHeaderProps {
  projectName: string;
  projectId: string;
}

export function EditorHeader({ projectName, projectId }: EditorHeaderProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate save
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Project saved');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (quality: 'fast' | 'standard' | 'high') => {
    try {
      setShowExportMenu(false);
      toast.loading('Starting export...');
      // Simulate export
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success(`Exporting at ${quality} quality`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  return (
    <header className="border-b border-qc-border bg-qc-panel px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <Zap className="w-5 h-5 text-qc-primary" />
        <div>
          <h1 className="text-lg font-bold">{projectName}</h1>
          <p className="text-xs text-gray-400">Editing • Auto Mode</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="p-2 hover:bg-qc-border rounded-lg transition disabled:opacity-50"
          title="Save project"
        >
          <Save className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-4 py-2 bg-qc-primary hover:bg-opacity-90 rounded-lg flex items-center gap-2 transition font-semibold"
          >
            <Download className="w-4 h-4" />
            Export
            <ChevronDown className="w-4 h-4" />
          </button>

          {showExportMenu && (
            <div className="absolute top-full right-0 mt-2 bg-qc-panel border border-qc-border rounded-lg shadow-lg z-50 min-w-48 overflow-hidden">
              <button
                onClick={() => handleExport('fast')}
                className="w-full text-left px-4 py-2 hover:bg-qc-border transition border-b border-qc-border"
              >
                <span className="font-medium">720p Fast</span>
                <p className="text-xs text-gray-400">Lower quality, quick export</p>
              </button>
              <button
                onClick={() => handleExport('standard')}
                className="w-full text-left px-4 py-2 hover:bg-qc-border transition border-b border-qc-border"
              >
                <span className="font-medium">1080p Standard</span>
                <p className="text-xs text-gray-400">Recommended quality</p>
              </button>
              <button
                onClick={() => handleExport('high')}
                className="w-full text-left px-4 py-2 hover:bg-qc-border transition"
              >
                <span className="font-medium">4K High</span>
                <p className="text-xs text-gray-400">Premium quality</p>
              </button>
            </div>
          )}
        </div>

        <button className="p-2 hover:bg-qc-border rounded-lg transition" title="Settings">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
