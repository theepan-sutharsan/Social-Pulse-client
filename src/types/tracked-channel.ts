export interface TrackedChannel {
  id: number;
  added_by_id: number;
  platform: 'youtube';
  channel_id: string;
  channel_name: string;
  niche: string | null;
  created_at: string;
  video_count?: number;
}
