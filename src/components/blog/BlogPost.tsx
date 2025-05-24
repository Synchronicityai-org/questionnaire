import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Collapse,
  TextField,
  Button,
  Stack,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Comment,
  Flag,
} from '@mui/icons-material';
import { BlogPost as BlogPostType, BlogComment } from '../../types/blog';
import { useBlog } from '../../context/BlogContext';
import { useAuth } from '../../context/AuthContext';

interface BlogPostProps {
  post: BlogPostType;
  onMilestoneClick?: (milestoneId: string) => void;
}

const BlogPost: React.FC<BlogPostProps> = ({ post, onMilestoneClick }) => {
  const { user } = useAuth();
  const {
    addComment,
    flagComment,
    likePost,
    likeComment,
    flagPost,
  } = useBlog();

  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');

  const handleCommentSubmit = async () => {
    if (commentText.trim()) {
      await addComment(post.id, { content: commentText });
      setCommentText('');
    }
  };

  const handleFlag = async () => {
    if (flagReason.trim()) {
      await flagPost(post.id, flagReason);
      setFlagDialogOpen(false);
      setFlagReason('');
    }
  };

  const handleCommentFlag = async (commentId: string) => {
    if (flagReason.trim()) {
      await flagComment(post.id, commentId, flagReason);
      setFlagDialogOpen(false);
      setFlagReason('');
    }
  };

  const renderComment = (comment: BlogComment, isReply = false) => (
    <Box
      key={comment.id}
      sx={{
        ml: isReply ? 4 : 0,
        mt: 2,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 1,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Avatar src={comment.author.avatar} alt={comment.author.username} />
        <Typography variant="subtitle2">{comment.author.username}</Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(comment.createdAt).toLocaleDateString()}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ mt: 1 }}>
        {comment.content}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <IconButton
          size="small"
          onClick={() => likeComment(post.id, comment.id)}
        >
          {comment.likes > 0 ? (
            <Favorite fontSize="small" color="error" />
          ) : (
            <FavoriteBorder fontSize="small" />
          )}
        </IconButton>
        <Typography variant="caption">{comment.likes}</Typography>
        {user && (user.role === 'ADMIN' || user.role === 'MODERATOR') && (
          <IconButton
            size="small"
            onClick={() => {
              setFlagDialogOpen(true);
              handleCommentFlag(comment.id);
            }}
          >
            <Flag fontSize="small" color={comment.isFlagged ? 'error' : 'inherit'} />
          </IconButton>
        )}
      </Stack>
      {comment.replies?.map((reply) => renderComment(reply, true))}
    </Box>
  );

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Avatar src={post.author.avatar} alt={post.author.username} />
          <Box>
            <Typography variant="subtitle1">{post.author.username}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(post.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Stack>

        <Typography variant="h5" gutterBottom>
          {post.title}
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          {post.content}
        </Typography>

        {post.images.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Post image ${index + 1}`}
                style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
              />
            ))}
          </Box>
        )}

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {post.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" />
          ))}
        </Stack>

        {post.relatedMilestones && post.relatedMilestones.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Related Milestones:
            </Typography>
            <Stack direction="row" spacing={1}>
              {post.relatedMilestones.map((milestoneId) => (
                <Chip
                  key={milestoneId}
                  label={`Milestone ${milestoneId}`}
                  onClick={() => onMilestoneClick?.(milestoneId)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>
        )}

        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={() => likePost(post.id)}>
            {post.likes > 0 ? (
              <Favorite color="error" />
            ) : (
              <FavoriteBorder />
            )}
          </IconButton>
          <Typography variant="body2">{post.likes}</Typography>
          <IconButton onClick={() => setExpanded(!expanded)}>
            <Comment />
          </IconButton>
          {user && (user.role === 'ADMIN' || user.role === 'MODERATOR') && (
            <IconButton
              onClick={() => setFlagDialogOpen(true)}
              color={post.isFlagged ? 'error' : 'default'}
            >
              <Flag />
            </IconButton>
          )}
        </Stack>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleCommentSubmit}
              disabled={!commentText.trim()}
            >
              Comment
            </Button>

            <Box sx={{ mt: 2 }}>
              {post.comments.map((comment) => renderComment(comment))}
            </Box>
          </Box>
        </Collapse>
      </CardContent>

      <Dialog open={flagDialogOpen} onClose={() => setFlagDialogOpen(false)}>
        <DialogTitle>Flag Content</DialogTitle>
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
          <Button onClick={handleFlag} color="error">
            Flag
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default BlogPost; 