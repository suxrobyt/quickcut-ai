import { AIEditRequest, AIEditResponse, MediaMetadata } from '@/lib/types';

export interface IAIProvider {
  analyzeMedia(mediaIds: string[], metadata: unknown): Promise<unknown>;
  generateEditingPlan(request: AIEditRequest): Promise<AIEditResponse>;
  chat(projectId: string, message: string, history?: Array<{ role: string; content: string }>): Promise<string>;
}

export interface IVideoProvider {
  analyzeVideo(url: string): Promise<VideoAnalysis>;
  renderTimeline(projectId: string, assetIds: string[]): Promise<string>;
}

export interface IStorageProvider {
  uploadFile(file: File, path: string): Promise<{ url: string; path: string }>;
  downloadFile(path: string): Promise<Blob>;
  deleteFile(path: string): Promise<void>;
  generateThumbnail(videoUrl: string): Promise<string>;
}

export interface ITranscriptionProvider {
  transcribe(audioUrl: string): Promise<TranscriptionResult>;
}

export interface VideoAnalysis {
  duration: number;
  fps?: number;
  resolution?: { width: number; height: number };
  scenes?: Array<{ start: number; end: number; confidence: number }>;
  interesting_moments?: Array<{ start: number; end: number; score: number }>;
}

export interface TranscriptionResult {
  text: string;
  segments: Array<{ start: number; end: number; text: string }>;
  language: string;
}
