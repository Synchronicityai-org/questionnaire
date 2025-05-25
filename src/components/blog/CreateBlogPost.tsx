import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useBlog } from '../../context/BlogContext';
import { BlogPostInput, PostStatus } from '../../types/blog';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.5rem;
  @media (min-width: 430px) {
    padding: 1rem;
  }
  @media (min-width: 640px) {
    padding: 1.5rem;
  }
  @media (min-width: 1024px) {
    padding: 2rem;
  }
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #EDF2F7 0%, #F7FAFC 100%);
`;

const FeaturedCard = styled.div`
  background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
  padding: 2.5rem;
  margin: 0 auto 2rem auto;
  border-radius: 24px;
  max-width: 800px;
  box-shadow: 
    0 4px 6px rgba(31, 41, 55, 0.04),
    0 12px 16px rgba(31, 41, 55, 0.06);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #60A5FA 0%, #34D399 100%);
  }
`;

const CreateBlogPost: React.FC = () => {
  const { createPost, uploadImage } = useBlog();
  const [post, setPost] = useState<BlogPostInput>({
    title: '',
    content: '',
    tags: [],
    images: [],
    status: PostStatus.DRAFT,
  });
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!post.title.trim() || !post.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      await createPost(post);
      setSuccess('Blog post created successfully!');
      // Reset form
      setPost({
        title: '',
        content: '',
        tags: [],
        images: [],
        status: PostStatus.DRAFT,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const uploadPromises = Array.from(files).map(file => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      setPost(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    } catch (err) {
      setError('Failed to upload images');
    }
  };

  const handleRemoveImage = (index: number) => {
    setPost(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !post.tags.includes(newTag.trim())) {
      setPost(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  return (
    <Container>
      <FeaturedCard>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, fontSize: { xs: '2rem', sm: '2.5rem', md: '2.75rem' }, mb: 2, mt: 1, letterSpacing: '-0.03em', background: 'linear-gradient(90deg, #1E293B 0%, #475569 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Create New Blog Post
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            value={post.title}
            onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
            margin="normal"
            required
            InputProps={{ style: { fontSize: '1.25rem', fontWeight: 600 } }}
            InputLabelProps={{ style: { fontSize: '1.1rem' } }}
          />

          <TextField
            fullWidth
            label="Content"
            multiline
            rows={8}
            value={post.content}
            onChange={(e) => setPost(prev => ({ ...prev, content: e.target.value }))}
            margin="normal"
            required
            InputProps={{ style: { fontSize: '1.1rem', minHeight: 180 } }}
            InputLabelProps={{ style: { fontSize: '1.1rem' } }}
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Tags
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {post.tags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  sx={{ m: 0.5, fontSize: '1rem', height: 32 }}
                />
              ))}
            </Stack>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                label="Add Tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                InputProps={{ style: { fontSize: '1rem', height: 40 } }}
                InputLabelProps={{ style: { fontSize: '1rem' } }}
              />
              <Button
                variant="contained"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                sx={{ height: 40, fontSize: '1rem' }}
              >
                Add
              </Button>
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Images
            </Typography>
            <input
              accept="image/*"
              type="file"
              multiple
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button variant="outlined" component="span" sx={{ fontSize: '1rem', height: 40 }}>
                Upload Images
              </Button>
            </label>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
              {post.images.map((image, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    width: 100,
                    height: 100,
                  }}
                >
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 12,
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveImage(index)}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setPost(prev => ({ ...prev, status: PostStatus.DRAFT }))}
              sx={{ fontSize: '1.1rem', px: 3, py: 1.2 }}
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!post.title.trim() || !post.content.trim()}
              sx={{ fontSize: '1.1rem', px: 3, py: 1.2 }}
            >
              Publish Post
            </Button>
          </Box>
        </form>
      </FeaturedCard>
    </Container>
  );
};

export default CreateBlogPost; 