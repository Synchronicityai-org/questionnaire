import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Chip,
  Stack,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { generateTags, combineTags } from '../../utils/tagGenerator';
import { BlogPostInput, PostStatus } from '../../types/blog';
import { UserRole } from '../../types/auth';

interface BlogEditorProps {
  userRole: UserRole;
  onSubmit: (post: BlogPostInput) => void;
  initialPost?: BlogPostInput;
}

const BlogEditor: React.FC<BlogEditorProps> = ({
  userRole,
  onSubmit,
  initialPost,
}) => {
  const [post, setPost] = useState<BlogPostInput>({
    title: '',
    content: '',
    tags: [],
    status: PostStatus.DRAFT,
    ...(initialPost || {}),
    images: initialPost?.images ?? [],
  });
  const [newTag, setNewTag] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Generate suggested tags whenever content changes
  useEffect(() => {
    if (post.content.length > 50) {
      const tags = generateTags(post.content);
      setSuggestedTags(tags);
    }
  }, [post.content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setPost(prev => ({ ...prev, content: newContent }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPost(prev => ({ ...prev, title: e.target.value }));
  };

  const handleAddTag = (tag: string) => {
    if (tag && !post.tags.includes(tag)) {
      setPost(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleAddSuggestedTag = (tag: string) => {
    handleAddTag(tag);
    setSuggestedTags(prev => prev.filter(t => t !== tag));
  };

  const handleSubmit = () => {
    if (!post.title || !post.content) {
      setError('Title and content are required');
      return;
    }

    // Combine user-selected tags with auto-generated tags
    const finalTags = combineTags(post.tags, post.content);
    
    // Set post status based on user role
    const status = userRole === UserRole.ADMIN 
      ? PostStatus.PUBLISHED 
      : PostStatus.DRAFT;

    onSubmit({
      ...post,
      tags: finalTags,
      status,
      images: post.images ?? [],
    });
  };

  const canPublish = userRole === UserRole.ADMIN;

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        {initialPost ? 'Edit Blog Post' : 'Create New Blog Post'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Title"
        value={post.title}
        onChange={handleTitleChange}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Content"
        multiline
        rows={6}
        value={post.content}
        onChange={handleContentChange}
        margin="normal"
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Tags
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {post.tags.map(tag => (
            <Chip
              key={tag}
              label={tag}
              onDelete={() => handleRemoveTag(tag)}
              sx={{ m: 0.5 }}
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
                handleAddTag(newTag);
              }
            }}
          />
          <Button
            variant="contained"
            onClick={() => handleAddTag(newTag)}
            disabled={!newTag}
          >
            Add
          </Button>
        </Box>
      </Box>

      {suggestedTags.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Suggested Tags
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {suggestedTags.map(tag => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => handleAddSuggestedTag(tag)}
                sx={{ m: 0.5 }}
              />
            ))}
          </Stack>
        </Box>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => onSubmit({ ...post, status: PostStatus.DRAFT, images: post.images ?? [] })}
        >
          Save as Draft
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!post.title || !post.content}
        >
          {canPublish ? 'Publish Post' : 'Submit for Review'}
        </Button>
      </Box>
    </Paper>
  );
};

export default BlogEditor; 