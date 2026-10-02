// Project types
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';
export type EditingMode = 'AUTO' | 'SMART' | 'MANUAL' | 'MEME' | 'SHORTS' | 'CINEMATIC' | 'MUSIC_SYNC';
export type ProjectStatus = 'DRAFT' | 'UPLOADING' | 'ANALYZING' | 'EDITING' | 'RENDERING' | 'COMPLETED' | 'FAILED';
export type MediaType = 'video' | 'image' | 'audio';
export type AssetStatus = 'uploading' | 'analyzing' | 'ready' | 'failed';

// Database models
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  thumbnail_url?: string;
  media_duration: number;
  aspect_ratio: AspectRatio;
  editing_mode: EditingMode;
}

export interface MediaAsset {
  id: string;
  project_id: string;
  file_name: string;
  type: MediaType;
  mime_type: string;
  file_size: number;
  duration?: number;
  resolution_width?: number;
  resolution_height?: number;
  thumbnail_url: string;
  storage_url: string;
  status: AssetStatus;
  metadata?: MediaMetadata;
  created_at: string;
  upload_progress?: number;
}

export interface MediaMetadata {
  fps?: number;
  bitrate?: number;
  codec?: string;
  scenes?: SceneData[];
  faces?: number;
  objects?: string[];
  dominant_colors?: string[];
  quality?: 'poor' | 'fair' | 'good' | 'excellent';
  speech_detected?: boolean;
  silence_segments?: TimeSegment[];
  interesting_moments?: TimeSegment[];
}

export interface SceneData {
  start: number;
  end: number;
  confidence: number;
  type: 'scene_change' | 'highlight' | 'silence' | 'motion';
}

export interface TimeSegment {
  start: number;
  end: number;
  score: number;
}

export interface EditingPlan {
  id?: string;
  project_id?: string;
  duration: number;
  aspect_ratio: AspectRatio;
  style: string;
  clips: ClipInstruction[];
  transitions: TransitionInstruction[];
  music?: MusicInstruction;
  captions?: CaptionInstruction[];
  effects: EffectInstruction[];
  color_grade?: ColorGradeInstruction;
  text_overlays?: TextOverlay[];
  version?: number;
  created_at?: string;
}

export interface ClipInstruction {
  id: string;
  source_id: string;
  start: number;
  end: number;
  purpose: 'hook' | 'main' | 'transition' | 'climax' | 'outro';
  speed?: number;
  crop_region?: CropRegion;
}

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TransitionInstruction {
  id: string;
  from_clip: string;
  to_clip: string;
  type: 'cut' | 'fade' | 'dissolve' | 'slide' | 'zoom';
  duration: number;
}

export interface MusicInstruction {
  source_id?: string;
  bpm?: number;
  beat_positions?: number[];
  volume_envelope?: VolumePoint[];
}

export interface VolumePoint {
  time: number;
  volume: number;
}

export interface CaptionInstruction {
  id: string;
  text: string;
  start_time: number;
  end_time: number;
  preset: 'tiktok' | 'youtube' | 'instagram' | 'cinematic' | 'minimal' | 'bold' | 'meme';
}

export interface EffectInstruction {
  id: string;
  type: 'zoom' | 'slowmo' | 'speedup' | 'stabilize' | 'blur' | 'sharpen' | 'vignette';
  target_clip: string;
  intensity: number;
}

export interface ColorGradeInstruction {
  id: string;
  preset?: 'cinematic' | 'vibrant' | 'minimal' | 'vintage' | 'cool';
  saturation: number;
  contrast: number;
  brightness: number;
  shadows: number;
  highlights: number;
}

export interface TextOverlay {
  id: string;
  text: string;
  start_time: number;
  end_time: number;
  position: 'top' | 'center' | 'bottom';
  font_size: number;
  color: string;
}

export interface RenderJob {
  id: string;
  project_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  quality: 'fast' | 'standard' | 'high';
  resolution: '720p' | '1080p' | '4k';
  fps: number;
  progress: number;
  created_at: string;
  completed_at?: string;
  output_url?: string;
  error_message?: string;
}

export interface AIEditRequest {
  project_id: string;
  user_instruction: string;
  media_ids: string[];
  current_plan?: EditingPlan;
  target_duration?: number;
  aspect_ratio: AspectRatio;
  style?: string;
}

export interface AIEditResponse {
  plan: EditingPlan;
  reasoning: string;
  confidence: number;
  suggestions: string[];
}

export interface ChatMessage {
  id: string;
  project_id: string;
  role: 'user' | 'assistant';
  message: string;
  created_at: string;
  actions?: string[];
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}
