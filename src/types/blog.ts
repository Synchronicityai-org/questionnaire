import { User } from './auth';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  status: PostStatus;
  images: string[];
  tags: string[];
  relatedMilestones?: string[]; // IDs of related milestones
  comments: BlogComment[];
  likes: number;
  isFlagged: boolean;
  flaggedBy?: User[];
  flaggedReason?: string;
}

export interface BlogComment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  likes: number;
  isFlagged: boolean;
  parentCommentId?: string; // For nested comments
  replies?: BlogComment[];
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  FLAGGED = 'FLAGGED',
  DELETED = 'DELETED'
}

export interface BlogPostInput {
  title: string;
  content: string;
  images: string[];
  tags: string[];
  relatedMilestones?: string[];
  status: PostStatus;
}

export interface BlogCommentInput {
  content: string;
  parentCommentId?: string;
}

// For filtering and searching blog posts
export interface BlogFilters {
  searchTerm?: string;
  tags?: string[];
  relatedMilestone?: string;
  authorId?: string;
  status?: PostStatus;
  dateRange?: {
    start: string;
    end: string;
  };
} 