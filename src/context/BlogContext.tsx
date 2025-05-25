import React, { createContext, useContext, useState, useCallback } from 'react';
import { BlogPost, BlogPostInput, BlogCommentInput, BlogFilters, PostStatus } from '../types/blog';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { getCurrentUser } from 'aws-amplify/auth';
import { User } from '../types/auth';

interface BlogContextType {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  createPost: (post: BlogPostInput) => Promise<void>;
  updatePost: (id: string, post: Partial<BlogPostInput>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  flagPost: (id: string, reason: string) => Promise<void>;
  addComment: (postId: string, comment: BlogCommentInput) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  flagComment: (postId: string, commentId: string, reason: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  likeComment: (postId: string, commentId: string) => Promise<void>;
  filterPosts: (filters: BlogFilters) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = generateClient<Schema>();
      const response = await client.models.BlogPost.list({});
      const validPosts = (response.data || [])
        .filter(p => p && typeof p.id === 'string' && p.id)
        .map(p => ({
          ...p,
          id: String(p.id),
          createdAt: p.createdAt ? String(p.createdAt) : '',
          updatedAt: p.updatedAt ? String(p.updatedAt) : '',
          status: (p.status || 'DRAFT') as PostStatus,
          images: Array.isArray(p.images) ? p.images.filter((img): img is string => typeof img === 'string') : [],
          tags: Array.isArray(p.tags) ? p.tags.filter((tag): tag is string => typeof tag === 'string') : [],
          comments: Array.isArray(p.comments) ? p.comments : [],
          likes: typeof p.likes === 'number' ? p.likes : 0,
          isFlagged: typeof p.isFlagged === 'boolean' ? p.isFlagged : false,
          flaggedReason: p.flaggedReason === null ? undefined : p.flaggedReason,
          author: typeof p.author === 'function'
            ? { id: p.authorId || '', username: p.authorName || 'Unknown', email: '', role: 'PARENT' as any }
            : (p.author || { id: '', username: 'Unknown', email: '', role: 'PARENT' as any })
        }));
      setPosts(validPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper to generate a slug from the title
  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 60);
  }

  const createPost = useCallback(async (post: BlogPostInput) => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = await getCurrentUser();
      if (!currentUser?.userId) throw new Error('User not authenticated');
      const slug = generateSlug(post.title);
      const now = new Date().toISOString();
      const client = generateClient<Schema>();
      await client.models.BlogPost.create({
        ...post,
        slug,
        authorId: currentUser.userId,
        createdAt: now,
        updatedAt: now,
        status: post.status || 'DRAFT',
        isPublic: true,
        images: post.images ?? [],
        tags: post.tags ?? [],
        summary: post.content.slice(0, 120),
        authorName: currentUser.username || 'Unknown',
        authorAvatar: '',
        likes: 0,
        isFlagged: false,
        flaggedReason: '',
        shareUrl: '',
        ogImage: '',
      });
      await fetchPosts();
    } catch (err) {
      console.error('Amplify create error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  }, [fetchPosts]);

  const updatePost = useCallback(async (id: string, post: Partial<BlogPostInput>) => {
    try {
      setLoading(true);
      setError(null);
      const client = generateClient<Schema>();
      await client.models.BlogPost.update({ id, ...post });
      await fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
    } finally {
      setLoading(false);
    }
  }, [fetchPosts]);

  const deletePost = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const client = generateClient<Schema>();
      await client.models.BlogPost.delete({ id });
      await fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    } finally {
      setLoading(false);
    }
  }, [fetchPosts]);

  const flagPost = useCallback(async (_id: string, _reason: string) => {
    try {
      setLoading(true);
      // TODO: Implement post flagging with Amplify
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to flag post');
    } finally {
      setLoading(false);
    }
  }, []);

  const addComment = useCallback(async (_postId: string, _comment: BlogCommentInput) => {
    try {
      setLoading(true);
      // TODO: Implement comment creation with Amplify
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteComment = useCallback(async (_postId: string, _commentId: string) => {
    try {
      setLoading(true);
      // TODO: Implement comment deletion with Amplify
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
    } finally {
      setLoading(false);
    }
  }, []);

  const flagComment = useCallback(async (_postId: string, _commentId: string, _reason: string) => {
    try {
      setLoading(true);
      // TODO: Implement comment flagging with Amplify
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to flag comment');
    } finally {
      setLoading(false);
    }
  }, []);

  const likePost = useCallback(async (_postId: string) => {
    try {
      setLoading(true);
      // TODO: Implement post liking with Amplify
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like post');
    } finally {
      setLoading(false);
    }
  }, []);

  const likeComment = useCallback(async (_postId: string, _commentId: string) => {
    try {
      setLoading(true);
      // TODO: Implement comment liking with Amplify
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like comment');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterPosts = useCallback(async (filters: BlogFilters) => {
    await fetchPosts();
    setPosts(prevPosts => {
      let filtered = [...prevPosts];
      if (filters.status) {
        filtered = filtered.filter(post => post.status === filters.status);
      }
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(post =>
          post.title.toLowerCase().includes(term) ||
          post.content.toLowerCase().includes(term)
        );
      }
      return filtered;
    });
  }, [fetchPosts]);

  const uploadImage = useCallback(async (_file: File): Promise<string> => {
    try {
      setLoading(true);
      // TODO: Implement image upload with Amplify Storage
      return '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <BlogContext.Provider
      value={{
        posts,
        loading,
        error,
        createPost,
        updatePost,
        deletePost,
        flagPost,
        addComment,
        deleteComment,
        flagComment,
        likePost,
        likeComment,
        filterPosts,
        uploadImage,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
}; 