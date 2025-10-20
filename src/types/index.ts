export interface Shot {
  id: number;
  thumbnail: string;
  timestamp: string;
  selected: boolean;
  timeInSeconds?: number;
}

export interface CaptionData {
  id: number;
  shotId: number;
  frameName: string;
  captionText: string;
  timestamp: string;
}

export interface VideoProcessingResult {
  videoId: string;
  frames: Shot[];
}