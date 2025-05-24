import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useBlog } from '../../context/BlogContext';
import { useAuth } from '../../context/AuthContext';
import BlogPost from './BlogPost';
import { BlogFilters, PostStatus } from '../../types/blog';

const BlogList: React.FC = () => {
  const { user } = useAuth();
  const { posts, loading, error, filterPosts } = useBlog();
  const [filters, setFilters] = useState<BlogFilters>({
    searchTerm: '',
    status: PostStatus.PUBLISHED,
  });
  const [page, setPage] = useState(1);
  const postsPerPage = 5;

  useEffect(() => {
    filterPosts(filters);
  }, [filters]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      searchTerm: e.target.value,
    }));
    setPage(1);
  };

  const handleStatusChange = (e: SelectChangeEvent<PostStatus>) => {
    setFilters(prev => ({
      ...prev,
      status: e.target.value as PostStatus,
    }));
    setPage(1);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const paginatedPosts = posts.slice(
    (page - 1) * postsPerPage,
    page * postsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Typography variant="h4">Blog Posts</Typography>
        {user && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            href="/blog/create"
          >
            Create Post
          </Button>
        )}
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <TextField
          label="Search posts"
          variant="outlined"
          value={filters.searchTerm}
          onChange={handleSearch}
          sx={{ flexGrow: 1 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={handleStatusChange}
          >
            <MenuItem value={PostStatus.PUBLISHED}>Published</MenuItem>
            <MenuItem value={PostStatus.DRAFT}>Drafts</MenuItem>
            {user?.role === 'ADMIN' && (
              <MenuItem value={PostStatus.FLAGGED}>Flagged</MenuItem>
            )}
          </Select>
        </FormControl>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : paginatedPosts.length === 0 ? (
        <Alert severity="info" sx={{ mb: 4 }}>
          No posts found matching your criteria.
        </Alert>
      ) : (
        <>
          <Stack spacing={3}>
            {paginatedPosts.map(post => (
              <BlogPost key={post.id} post={post} />
            ))}
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={Math.ceil(posts.length / postsPerPage)}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default BlogList; 