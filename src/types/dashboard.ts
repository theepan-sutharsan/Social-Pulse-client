import { ConnectedAccount } from './account';
import { Video } from './video';
import { Suggestion } from './suggestion';

export interface DashboardData {
  accounts: ConnectedAccount[];
  recent_videos: Video[];
  growth_series: Array<{
    video_id: number;
    title: string;
    series: any[];
  }>;
  recent_suggestions: Suggestion[];
  tracked_channels_count: number;
  totals: {
    connected_accounts: number;
    videos: number;
    suggestions: number;
  };
}
