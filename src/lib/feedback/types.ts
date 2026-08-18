export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  posts_count?: number;
  followers_count?: number;
  following_count?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
}

export interface Feedback {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  category_id: string | null;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    id: string;
  };
  community_categories?: {
    name: string;
    slug: string;
    icon: string | null;
  };
  user_has_liked?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  parent_id: string | null;
  created_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    id: string;
  };
}

export interface Notification {
  id: string;
  receiver_id: string;
  sender_id: string | null;
  type: 'like' | 'comment' | 'follow' | 'reply' | 'system';
  post_id: string | null;
  comment_id: string | null;
  is_read: boolean;
  created_at: string;
  sender?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}
