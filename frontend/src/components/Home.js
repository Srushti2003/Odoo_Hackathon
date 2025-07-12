import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  useMediaQuery,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  Stack,
  Pagination
} from '@mui/material';
import { 
  ThumbUp, 
  ThumbDown, 
  QuestionAnswer, 
  Person, 
  Schedule,
  TrendingUp,
  Visibility
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const questionsPerPage = 6;
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Reset page when search or sort changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, sortBy]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/questions');
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (questionId, voteType) => {
    if (!user) {
      alert('Please login to vote');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/vote', {
        questionId,
        voteType
      });
      setQuestions(prevQuestions =>
        prevQuestions.map(q =>
          q.id === questionId
            ? { ...q, votes: q.votes + voteType }
            : q
        )
      );
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const filteredAndSortedQuestions = questions
    .filter(question =>
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'votes':
          return b.votes - a.votes;
        case 'answers':
          return b.answerCount - a.answerCount;
        default:
          return 0;
      }
    });

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedQuestions.length / questionsPerPage);
  const startIndex = (page - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = filteredAndSortedQuestions.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading questions...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ mt: isMobile ? 2 : 4, px: isMobile ? 1 : 3 }}>
      <Box sx={{ mb: isMobile ? 2 : 4 }}>
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
          StackIt - Q&A Platform
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Ask questions, share knowledge, and learn from the community
        </Typography>
      </Box>

      <Box
        sx={{
          mb: isMobile ? 2 : 3,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          flexWrap: isMobile ? 'nowrap' : 'wrap',
        }}
      >
        <TextField
          label="Search questions..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: isMobile ? '100%' : 300, flex: 1 }}
        />

        <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 150 }}>
          <InputLabel>Sort by</InputLabel>
          <Select
            value={sortBy}
            label="Sort by"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
            <MenuItem value="votes">Most Votes</MenuItem>
            <MenuItem value="answers">Most Answers</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ width: '100%' }}>
        {currentQuestions.map((question) => (
          <Box key={question.id} sx={{ mb: 3, width: '100%' }}>
            <Card 
              sx={{ 
                p: isMobile ? 1 : 2,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid #e3f2fd',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                  border: '1px solid #2196f3',
                }
              }}
            >
              <CardContent sx={{ p: isMobile ? 1 : 2 }}>
                <Box sx={{ display: 'flex', gap: 3, flexDirection: isMobile ? 'column' : 'row' }}>
                  {/* Enhanced Voting Section */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: 80,
                      mb: isMobile ? 2 : 0,
                      background: 'linear-gradient(180deg, #f5f5f5 0%, #e0e0e0 100%)',
                      borderRadius: 2,
                      p: 1,
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <Tooltip title="Upvote">
                      <IconButton
                        size="small"
                        onClick={() => handleVote(question.id, 1)}
                        disabled={!user}
                        sx={{
                          color: question.votes > 0 ? 'success.main' : 'text.secondary',
                          '&:hover': { color: 'success.main' }
                        }}
                      >
                        <ThumbUp fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        my: 1,
                        fontWeight: 'bold',
                        color: question.votes > 0 ? 'success.main' : question.votes < 0 ? 'error.main' : 'text.primary'
                      }}
                    >
                      {question.votes}
                    </Typography>
                    
                    <Tooltip title="Downvote">
                      <IconButton
                        size="small"
                        onClick={() => handleVote(question.id, -1)}
                        disabled={!user}
                        sx={{
                          color: question.votes < 0 ? 'error.main' : 'text.secondary',
                          '&:hover': { color: 'error.main' }
                        }}
                      >
                        <ThumbDown fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Enhanced Question Content */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant={isMobile ? "h6" : "h5"}
                      component={RouterLink}
                      to={`/question/${question.id}`}
                      sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        fontWeight: 600,
                        fontSize: isMobile ? '1.1rem' : '1.3rem',
                        lineHeight: 1.3,
                        display: 'block',
                        mb: 1,
                        '&:hover': { 
                          color: 'primary.main',
                          textDecoration: 'underline'
                        },
                      }}
                    >
                      {question.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {question.content}
                    </Typography>

                    {/* Enhanced Tags */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {question.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="filled"
                          sx={{
                            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                            color: '#1976d2',
                            fontWeight: 500,
                            '&:hover': {
                              background: 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)',
                            }
                          }}
                        />
                      ))}
                    </Box>

                    {/* Enhanced Metadata */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: 2, 
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      pt: 1,
                      borderTop: '1px solid #f0f0f0',
                      justifyContent: 'space-between'
                    }}>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                            <Person fontSize="small" />
                          </Avatar>
                          <Typography variant="body2" color="text.secondary">
                            {question.author}
                          </Typography>
                        </Stack>
                        
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Schedule fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(question.createdAt).toLocaleDateString()}
                          </Typography>
                        </Stack>
                        
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Visibility fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {question.viewCount || 0} views
                          </Typography>
                        </Stack>
                      </Box>

                      {/* Answer Count Badge */}
                      <Box sx={{
                        background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                        border: '2px solid #4caf50',
                        borderRadius: 3,
                        px: 2,
                        py: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        minWidth: 80,
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                        }
                      }}>
                        <QuestionAnswer fontSize="small" sx={{ color: '#2e7d32' }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#2e7d32',
                            fontSize: '0.9rem'
                          }}
                        >
                          {question.answerCount} {question.answerCount === 1 ? 'answer' : 'answers'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {filteredAndSortedQuestions.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No questions found
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {filteredAndSortedQuestions.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 4, 
          mb: 2,
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <Typography variant="body2" color="text.secondary">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedQuestions.length)} of {filteredAndSortedQuestions.length} questions
          </Typography>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange}
            color="primary"
            size={isMobile ? "small" : "medium"}
            showFirstButton 
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 2,
                fontWeight: 500,
              },
              '& .Mui-selected': {
                background: 'linear-gradient(135deg, #FF5A1F 0%, #F9B8E2 100%)',
                color: 'white',
                fontWeight: 600,
              },
            }}
          />
        </Box>
      )}
    </Container>
  );
};

export default Home; 