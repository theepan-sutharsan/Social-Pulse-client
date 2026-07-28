export interface ConnectedAccount {
  id: number;
  user_id: number;
  platform: 'youtube' | 'instagram' | 'facebook' | 'tiktok';
  platform_account_id: string;
  display_name: string;
  last_synced_at: string | null;
  created_at: string;
  video_count?: number;
}
