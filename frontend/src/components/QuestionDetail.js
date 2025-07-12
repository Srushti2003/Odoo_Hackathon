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
  Alert
} from '@mui/material';
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
      {/* Question */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Voting Section */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              minWidth: 60
            }}>
              <Button
                size="small"
                onClick={() => handleVote(question.id, null, 1)}
                disabled={!user}
              >
                ▲
              </Button>
              <Typography variant="h6" sx={{ my: 1 }}>
                {question.votes}
              </Typography>
              <Button
                size="small"
                onClick={() => handleVote(question.id, null, -1)}
                disabled={!user}
              >
                ▼
              </Button>
            </Box>

            {/* Question Content */}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                {question.title}
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                {question.content}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {question.tags.map((tag, index) => (
                  <Chip 
                    key={index} 
                    label={tag} 
                    size="small" 
                    variant="outlined"
                  />
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Asked by {question.author}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(question.createdAt).toLocaleDateString()}
                </Typography>
              </Box>

              {/* Delete button for question author or admin */}
              {(user?.id === question.author || user?.role === 'admin') && (
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  onClick={handleDeleteQuestion}
                >
                  Delete Question
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Answers Section */}
      <Typography variant="h5" gutterBottom>
        {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
      </Typography>

      {question.answers.map((answer) => (
        <Card key={answer.id} sx={{ mb: 2, border: answer.isAccepted ? 2 : 1, borderColor: answer.isAccepted ? 'success.main' : 'divider' }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Voting Section */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                minWidth: 60
              }}>
                <Button
                  size="small"
                  onClick={() => handleVote(null, answer.id, 1)}
                  disabled={!user}
                >
                  ▲
                </Button>
                <Typography variant="h6" sx={{ my: 1 }}>
                  {answer.votes}
                </Typography>
                <Button
                  size="small"
                  onClick={() => handleVote(null, answer.id, -1)}
                  disabled={!user}
                >
                  ▼
                </Button>
              </Box>

              {/* Answer Content */}
              <Box sx={{ flexGrow: 1 }}>
                {answer.isAccepted && (
                  <Chip 
                    label="Accepted Answer" 
                    color="success" 
                    size="small" 
                    sx={{ mb: 1 }}
                  />
                )}
                
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {answer.content}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Answered by {answer.author}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(answer.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {/* Accept answer button (only for question author) */}
                  {user?.id === question.author && !answer.isAccepted && (
                    <Button 
                      variant="outlined" 
                      color="success" 
                      size="small"
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
                      onClick={() => handleDeleteAnswer(answer.id)}
                    >
                      Delete Answer
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* Answer Form */}
      {user && user.role !== 'guest' && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
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
                rows={4}
                label="Write your answer..."
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                margin="normal"
                required
              />
              
              <Button
                type="submit"
                variant="contained"
                disabled={submitting || !answerContent.trim()}
                sx={{ mt: 2 }}
              >
                {submitting ? 'Posting Answer...' : 'Post Answer'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="body1" align="center">
              Please <Button onClick={() => navigate('/login')}>login</Button> to post an answer.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default QuestionDetail; 