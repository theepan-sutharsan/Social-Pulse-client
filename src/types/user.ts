export interface User {
  id: number;
  email: string;
  role: 'admin' | 'member';
  full_name: string;
  is_active: boolean;
  created_at: string;
}
