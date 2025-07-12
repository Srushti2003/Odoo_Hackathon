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
  Divider,
  Alert,
  Avatar,
  IconButton,
  Tooltip,
  Stack,
  Paper,
  Badge
} from '@mui/material';
import { 
  ThumbUp, 
  ThumbDown, 
  Person, 
  Schedule,
  CheckCircle,
  Delete,
  Edit,
  Send,
  QuestionAnswer,
  Visibility
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const QuestionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/questions/${id}`);
      setQuestion(response.data);
    } catch (error) {
      console.error('Error fetching question:', error);
      setError('Question not found');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (questionId, answerId, voteType) => {
    if (!user) {
      alert('Please login to vote');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/vote', {
        questionId,
        answerId,
        voteType
      });
      
      // Refresh the question to get updated vote counts
      fetchQuestion();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to answer');
      return;
    }

    if (!answerContent.trim()) {
      setError('Answer content is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await axios.post(`http://localhost:5000/api/questions/${id}/answers`, {
        content: answerContent
      });
      
      setAnswerContent('');
      fetchQuestion(); // Refresh to show new answer
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      await axios.post(`http://localhost:5000/api/answers/${answerId}/accept`);
      fetchQuestion(); // Refresh to show updated acceptance status
    } catch (error) {
      console.error('Error accepting answer:', error);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/questions/${id}`);
      navigate('/');
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/answers/${answerId}`);
      fetchQuestion(); // Refresh to remove deleted answer
    } catch (error) {
      console.error('Error deleting answer:', error);
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading question...</Typography>
      </Container>
    );
  }

  if (error && !question) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!question) {
    return (
      <Container>
        <Typography>Question not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Enhanced Question Card */}
      <Card sx={{ 
        mb: 4,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        border: '2px solid #e3f2fd',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* Enhanced Voting Section */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              minWidth: 80,
              background: 'linear-gradient(180deg, #f5f5f5 0%, #e0e0e0 100%)',
              borderRadius: 2,
              p: 2,
              border: '1px solid #e0e0e0'
            }}>
              <Tooltip title="Upvote">
                <IconButton
                  size="small"
                  onClick={() => handleVote(question.id, null, 1)}
                  disabled={!user}
                  sx={{
                    color: question.votes > 0 ? 'success.main' : 'text.secondary',
                    '&:hover': { color: 'success.main' }
                  }}
                >
                  <ThumbUp fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Typography variant="h5" sx={{ 
                my: 1,
                fontWeight: 'bold',
                color: question.votes > 0 ? 'success.main' : question.votes < 0 ? 'error.main' : 'text.primary'
              }}>
                {question.votes}
              </Typography>
              
              <Tooltip title="Downvote">
                <IconButton
                  size="small"
                  onClick={() => handleVote(question.id, null, -1)}
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
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                {question.title}
              </Typography>
              
              <Typography variant="body1" sx={{ 
                mb: 3,
                fontSize: '1.1rem',
                lineHeight: 1.6,
                color: '#333'
              }}>
                {question.content}
              </Typography>

              {/* Enhanced Tags */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {question.tags.map((tag, index) => (
                  <Chip 
                    key={index} 
                    label={tag} 
                    size="medium" 
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
                gap: 3, 
                alignItems: 'center',
                flexWrap: 'wrap',
                pt: 2,
                borderTop: '1px solid #f0f0f0'
              }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    <Person fontSize="small" />
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    Asked by {question.author}
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

                {/* Delete button for question author or admin */}
                {(user?.id === question.author || user?.role === 'admin') && (
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="small"
                    startIcon={<Delete />}
                    onClick={handleDeleteQuestion}
                    sx={{ ml: 'auto' }}
                  >
                    Delete Question
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Enhanced Answers Section */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
      </Typography>

      {question.answers.map((answer) => (
        <Card 
          key={answer.id} 
          sx={{ 
            mb: 3,
            border: answer.isAccepted ? 3 : 1,
            borderColor: answer.isAccepted ? 'success.main' : 'divider',
            background: answer.isAccepted 
              ? 'linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {answer.isAccepted && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: 'success.main',
              color: 'white',
              px: 2,
              py: 0.5,
              borderBottomLeftRadius: 8,
              zIndex: 1
            }}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CheckCircle fontSize="small" />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  ACCEPTED
                </Typography>
              </Stack>
            </Box>
          )}
          
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {/* Enhanced Voting Section */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                minWidth: 80,
                background: 'linear-gradient(180deg, #f5f5f5 0%, #e0e0e0 100%)',
                borderRadius: 2,
                p: 2,
                border: '1px solid #e0e0e0'
              }}>
                <Tooltip title="Upvote">
                  <IconButton
                    size="small"
                    onClick={() => handleVote(null, answer.id, 1)}
                    disabled={!user}
                    sx={{
                      color: answer.votes > 0 ? 'success.main' : 'text.secondary',
                      '&:hover': { color: 'success.main' }
                    }}
                  >
                    <ThumbUp fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Typography variant="h6" sx={{ 
                  my: 1,
                  fontWeight: 'bold',
                  color: answer.votes > 0 ? 'success.main' : answer.votes < 0 ? 'error.main' : 'text.primary'
                }}>
                  {answer.votes}
                </Typography>
                
                <Tooltip title="Downvote">
                  <IconButton
                    size="small"
                    onClick={() => handleVote(null, answer.id, -1)}
                    disabled={!user}
                    sx={{
                      color: answer.votes < 0 ? 'error.main' : 'text.secondary',
                      '&:hover': { color: 'error.main' }
                    }}
                  >
                    <ThumbDown fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Enhanced Answer Content */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ 
                  mb: 3,
                  fontSize: '1.05rem',
                  lineHeight: 1.6,
                  color: '#333'
                }}>
                  {answer.content}
                </Typography>

                {/* Enhanced Metadata */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 3, 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  pt: 2,
                  borderTop: '1px solid #f0f0f0'
                }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main' }}>
                      <Person fontSize="small" />
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      Answered by {answer.author}
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Schedule fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(answer.createdAt).toLocaleDateString()}
                    </Typography>
                  </Stack>

                  <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                    {/* Accept answer button (only for question author) */}
                    {user?.id === question.author && !answer.isAccepted && (
                      <Button 
                        variant="outlined" 
                        color="success" 
                        size="small"
                        startIcon={<CheckCircle />}
                        onClick={() => handleAcceptAnswer(answer.id)}
                      >
                        Accept Answer
                      </Button>
                    )}

                    {/* Delete answer button (for answer author or admin) */}
                    {(user?.id === answer.author || user?.role === 'admin') && (
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteAnswer(answer.id)}
                      >
                        Delete Answer
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* Enhanced Answer Form */}
      {user && user.role !== 'guest' && (
        <Card sx={{ 
          mt: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '2px solid #e3f2fd',
          borderRadius: 3
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Your Answer
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmitAnswer}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Write your answer..."
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                margin="normal"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
              
              <Button
                type="submit"
                variant="contained"
                disabled={submitting || !answerContent.trim()}
                startIcon={<Send />}
                sx={{ mt: 2, px: 3, py: 1 }}
              >
                {submitting ? 'Posting Answer...' : 'Post Answer'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card sx={{ 
          mt: 4,
          background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
          border: '2px solid #ffb74d',
          borderRadius: 3
        }}>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Please login to post an answer.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/login')}
              startIcon={<QuestionAnswer />}
            >
              Login to Answer
            </Button>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default QuestionDetail; 