export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'audio' | 'video' | 'image' | 'document';
  tags: string[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
  summary?: string;
  transcription?: string;
  isStarred: boolean;
  audioUrl?: string; // URL for recorded audio playback
  duration?: number; // duration in seconds for audio notes
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}