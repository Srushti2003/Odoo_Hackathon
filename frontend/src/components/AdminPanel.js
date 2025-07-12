import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import axios from 'axios';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // In a real app, you'd have admin-specific endpoints
      // For now, we'll use the regular endpoints
      const [questionsRes, answersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/questions'),
        axios.get('http://localhost:5000/api/questions') // We'll get answers from questions
      ]);

      setQuestions(questionsRes.data);
      
      // Extract all answers from questions
      const allAnswers = questionsRes.data.flatMap(q => 
        q.answers ? q.answers.map(a => ({ ...a, questionTitle: q.title })) : []
      );
      setAnswers(allAnswers);
      
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}/role`, {
        role: newRole
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      setError('Failed to update user role');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/questions/${questionId}`);
      setQuestions(prevQuestions => 
        prevQuestions.filter(q => q.id !== questionId)
      );
    } catch (error) {
      setError('Failed to delete question');
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/answers/${answerId}`);
      setAnswers(prevAnswers => 
        prevAnswers.filter(a => a.id !== answerId)
      );
    } catch (error) {
      setError('Failed to delete answer');
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading admin panel...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage users, moderate content, and oversee the platform.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Questions" />
          <Tab label="Answers" />
        </Tabs>

        {/* Questions Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Questions ({questions.length})
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Author</TableCell>
                    <TableCell>Votes</TableCell>
                    <TableCell>Answers</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {questions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell>{question.title}</TableCell>
                      <TableCell>{question.author}</TableCell>
                      <TableCell>{question.votes}</TableCell>
                      <TableCell>{question.answerCount}</TableCell>
                      <TableCell>
                        {new Date(question.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Answers Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Answers ({answers.length})
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Content</TableCell>
                    <TableCell>Author</TableCell>
                    <TableCell>Question</TableCell>
                    <TableCell>Votes</TableCell>
                    <TableCell>Accepted</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {answers.map((answer) => (
                    <TableRow key={answer.id}>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography noWrap>
                          {answer.content}
                        </Typography>
                      </TableCell>
                      <TableCell>{answer.author}</TableCell>
                      <TableCell>{answer.questionTitle}</TableCell>
                      <TableCell>{answer.votes}</TableCell>
                      <TableCell>
                        {answer.isAccepted ? 'Yes' : 'No'}
                      </TableCell>
                      <TableCell>
                        {new Date(answer.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteAnswer(answer.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AdminPanel; 