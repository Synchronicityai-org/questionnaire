import React, { createContext, useContext, useState, useCallback } from 'react';
import { BlogPost, BlogPostInput, BlogCommentInput, BlogFilters } from '../types/blog';

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
  const [posts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = useCallback(async (_post: BlogPostInput) => {
    try {
      setLoading(true);
      // TODO: Implement post creation with Amplify
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePost = useCallback(async (_id: string, _post: Partial<BlogPostInput>) => {
    try {
      setLoading(true);
      // TODO: Implement post update with Amplify
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (_id: string) => {
    try {
      setLoading(true);
      // TODO: Implement post deletion with Amplify
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    } finally {
      setLoading(false);
    }
  }, []);

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

  const filterPosts = useCallback(async (_filters: BlogFilters) => {
    try {
      setLoading(true);
      // TODO: Implement post filtering with Amplify
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter posts');
    } finally {
      setLoading(false);
    }
  }, []);

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