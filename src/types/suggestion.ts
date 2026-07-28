import { Video } from './video';

export interface Suggestion {
  id: number;
  user_id: number;
  connected_account_id: number | null;
  tracked_channel_id: number | null;
  type: 'title' | 'caption' | 'hook' | 'hashtag' | 'thumbnail_concept' | 'posting_time' | 'content_calendar';
  input_context: string;
  output: any;
  created_at: string;
  source_videos?: Video[];
}
