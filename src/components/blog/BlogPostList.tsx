import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import { Delete as DeleteIcon, Flag as FlagIcon } from '@mui/icons-material';
import { BlogPost, PostStatus } from '../../types/blog';
import { UserRole } from '../../types/auth';

interface BlogPostListProps {
  posts: BlogPost[];
  currentUserRole: UserRole;
  onDeletePost: (postId: string) => void;
  onFlagPost: (postId: string, reason: string) => void;
}

const BlogPostList: React.FC<BlogPostListProps> = ({
  posts,
  currentUserRole,
  onDeletePost,
  onFlagPost,
}) => {
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [flagReason, setFlagReason] = useState('');

  const handleFlagClick = (post: BlogPost) => {
    setSelectedPost(post);
    setFlagDialogOpen(true);
  };

  const handleFlagSubmit = () => {
    if (selectedPost) {
      onFlagPost(selectedPost.id, flagReason);
      setFlagDialogOpen(false);
      setFlagReason('');
      setSelectedPost(null);
    }
  };

  const canDeletePost = (post: BlogPost) => {
    return currentUserRole === UserRole.ADMIN || 
           (currentUserRole === UserRole.MODERATOR && post.status === PostStatus.FLAGGED);
  };

  const canFlagPost = (post: BlogPost) => {
    return (currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.MODERATOR) && !!post;
  };

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map((blogPost) => (
              <TableRow key={blogPost.id}>
                <TableCell>{blogPost.title}</TableCell>
                <TableCell>{blogPost.author.username}</TableCell>
                <TableCell>
                  <Chip
                    label={blogPost.status}
                    color={
                      blogPost.status === PostStatus.PUBLISHED
                        ? 'success'
                        : blogPost.status === PostStatus.FLAGGED
                        ? 'error'
                        : 'default'
                    }
                  />
                </TableCell>
                <TableCell>
                  {new Date(blogPost.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {blogPost.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  {canFlagPost(blogPost) && (
                    <IconButton
                      onClick={() => handleFlagClick(blogPost)}
                      color={blogPost.isFlagged ? 'error' : 'default'}
                    >
                      <FlagIcon />
                    </IconButton>
                  )}
                  {canDeletePost(blogPost) && (
                    <IconButton
                      onClick={() => onDeletePost(blogPost.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={flagDialogOpen} onClose={() => setFlagDialogOpen(false)}>
        <DialogTitle>Flag Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for flagging"
            fullWidth
            multiline
            rows={4}
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFlagDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleFlagSubmit} color="error">
            Flag Post
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BlogPostList; 