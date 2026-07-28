export interface Video {
  id: number;
  connected_account_id?: number;
  tracked_channel_id?: number;
  platform: 'youtube' | 'instagram' | 'facebook' | 'tiktok';
  external_id: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail_url: string;
  duration_seconds: number;
  published_at: string;
  fetched_at: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  engagement_rate?: number;
}
