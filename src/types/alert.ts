export interface Alert {
  id: number;
  user_id: number;
  type: 'competitor_viral' | 'milestone';
  message: string;
  related_video_id: number | null;
  is_read: boolean;
  created_at: string;
}
