'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EditingPlan } from '@/lib/types';

interface TimelineProps {
  editingPlan: EditingPlan | null;
}

export function Timeline({ editingPlan }: TimelineProps) {
  const [zoom, setZoom] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);

  if (!editingPlan) {
    return (
      <div className="w-full h-full bg-qc-panel flex items-center justify-center text-gray-400">
        <p className="text-sm">Generate an AI edit to see the timeline</p>
      </div>
    );
  }

  const pixelsPerSecond = 50 * zoom;
  const totalWidth = editingPlan.duration * pixelsPerSecond;

  return (
    <div className="flex flex-col h-full bg-qc-panel">
      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-qc-border flex items-center gap-2">
        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
          className="p-1 hover:bg-qc-border rounded"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs text-gray-400">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(Math.min(3, zoom + 0.2))}
          className="p-1 hover:bg-qc-border rounded"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto relative">
        {/* Ruler */}
        <div className="sticky top-0 z-20 h-6 bg-qc-border border-b border-qc-border flex items-center px-4">
          {Array.from({ length: Math.ceil(editingPlan.duration) + 1 }).map(
            (_, i) => (
              <div
                key={i}
                style={{
                  width: `${pixelsPerSecond}px`,
                }}
                className="text-xs text-gray-400 relative"
              >
                <span className="absolute">{i}s</span>
              </div>
            )
          )}
        </div>

        {/* Clips */}
        <div className="relative p-4" style={{ width: totalWidth + 100 }}>
          {editingPlan.clips.map((clip) => (
            <div
              key={clip.id}
              className="mb-4"
            >
              <div
                style={{
                  marginLeft: `${clip.start * pixelsPerSecond}px`,
                  width: `${(clip.end - clip.start) * pixelsPerSecond}px`,
                }}
                className="h-12 bg-gradient-to-r from-qc-primary to-qc-secondary rounded cursor-grab active:cursor-grabbing hover:shadow-lg transition group"
              >
                <div className="px-2 py-1 text-xs font-medium truncate">
                  {clip.purpose}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
