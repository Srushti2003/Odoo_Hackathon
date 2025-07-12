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
  useMediaQuery
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchQuestions();
  }, []);

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

  if (loading) {
    return (
      <Container>
        <Typography>Loading questions...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: isMobile ? 2 : 4, px: isMobile ? 0.5 : 2 }}>
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

      <Grid container spacing={isMobile ? 1 : 3}>
        {filteredAndSortedQuestions.map((question) => (
          <Grid item xs={12} key={question.id}>
            <Card sx={{ p: isMobile ? 1 : 2 }}>
              <CardContent sx={{ p: isMobile ? 1 : 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
                  {/* Voting Section */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: 60,
                      mb: isMobile ? 1 : 0,
                    }}
                  >
                    <Button
                      size="small"
                      onClick={() => handleVote(question.id, 1)}
                      disabled={!user}
                    >
                      ▲
                    </Button>
                    <Typography variant="h6" sx={{ my: 1 }}>
                      {question.votes}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => handleVote(question.id, -1)}
                      disabled={!user}
                    >
                      ▼
                    </Button>
                  </Box>

                  {/* Question Content */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant={isMobile ? "h6" : "h6"}
                      component={RouterLink}
                      to={`/question/${question.id}`}
                      sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': { color: 'primary.main' },
                        fontSize: isMobile ? '1.05rem' : '1.15rem',
                        fontWeight: 600,
                      }}
                    >
                      {question.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        fontSize: isMobile ? '0.97rem' : '1rem',
                      }}
                    >
                      {question.content}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      {question.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Typography variant="body2" color="text.secondary">
                        Asked by {question.author}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {question.answerCount} answers
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredAndSortedQuestions.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No questions found
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Home; 