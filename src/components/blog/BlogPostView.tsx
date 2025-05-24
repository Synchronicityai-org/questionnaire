import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useBlog } from '../../context/BlogContext';
import BlogPost from './BlogPost';
import { BlogPost as BlogPostType } from '../../types/blog';

const BlogPostView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { posts, loading, error } = useBlog();
  const [post, setPost] = useState<BlogPostType | null>(null);

  useEffect(() => {
    if (id && posts.length > 0) {
      const foundPost = posts.find(p => p.id === id);
      setPost(foundPost || null);
    }
  }, [id, posts]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        {error}
      </Alert>
    );
  }

  if (!post) {
    return (
      <Alert severity="info" sx={{ m: 4 }}>
        Post not found
      </Alert>
    );
  }

  return <BlogPost post={post} />;
};

export default BlogPostView; 