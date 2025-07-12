const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stackit', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['guest', 'user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [String],
  votes: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const answerSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  votes: { type: Number, default: 0 },
  isAccepted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const voteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  answer: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer' },
  voteType: { type: Number, enum: [1, -1], required: true }, // 1 for upvote, -1 for downvote
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Question = mongoose.model('Question', questionSchema);
const Answer = mongoose.model('Answer', answerSchema);
const Vote = mongoose.model('Vote', voteSchema);

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Register
app.post('/api/register', [
  body('username').isLength({ min: 3 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all questions (public)
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    const questionsWithDetails = await Promise.all(questions.map(async (question) => {
      const answerCount = await Answer.countDocuments({ question: question._id });
      return {
        id: question._id,
        title: question.title,
        content: question.content,
        author: question.author.username,
        tags: question.tags,
        votes: question.votes,
        viewCount: question.viewCount,
        answerCount,
        createdAt: question.createdAt
      };
    }));

    res.json(questionsWithDetails);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create question (authenticated users only)
app.post('/api/questions', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role === 'guest') {
      return res.status(403).json({ error: 'Guests cannot create questions' });
    }

    const { title, content, tags } = req.body;
    const question = new Question({
      title,
      content,
      author: req.user.userId,
      tags: tags || []
    });

    await question.save();
    res.status(201).json({ message: 'Question created successfully', id: question._id });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single question with answers
app.get('/api/questions/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username');
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Increment view count
    await Question.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    const answers = await Answer.find({ question: req.params.id })
      .populate('author', 'username')
      .sort({ isAccepted: -1, votes: -1, createdAt: 1 });

    res.json({
      id: question._id,
      title: question.title,
      content: question.content,
      author: question.author.username,
      tags: question.tags,
      votes: question.votes,
      viewCount: question.viewCount + 1, // Include updated view count
      createdAt: question.createdAt,
      answers: answers.map(answer => ({
        id: answer._id,
        content: answer.content,
        author: answer.author.username,
        votes: answer.votes,
        isAccepted: answer.isAccepted,
        createdAt: answer.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create answer
app.post('/api/questions/:id/answers', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role === 'guest') {
      return res.status(403).json({ error: 'Guests cannot create answers' });
    }

    const { content } = req.body;
    const answer = new Answer({
      content,
      author: req.user.userId,
      question: req.params.id
    });

    await answer.save();
    res.status(201).json({ message: 'Answer created successfully', id: answer._id });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Vote on question or answer
app.post('/api/vote', authenticateToken, async (req, res) => {
  try {
    const { questionId, answerId, voteType } = req.body;

    if (![1, -1].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({
      user: req.user.userId,
      question: questionId,
      answer: answerId
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote
        await Vote.findByIdAndDelete(existingVote._id);
        // Update vote count
        if (questionId) {
          await Question.findByIdAndUpdate(questionId, { $inc: { votes: -voteType } });
        } else if (answerId) {
          await Answer.findByIdAndUpdate(answerId, { $inc: { votes: -voteType } });
        }
      } else {
        // Change vote
        existingVote.voteType = voteType;
        await existingVote.save();
        // Update vote count (add 2 to account for the change)
        if (questionId) {
          await Question.findByIdAndUpdate(questionId, { $inc: { votes: voteType * 2 } });
        } else if (answerId) {
          await Answer.findByIdAndUpdate(answerId, { $inc: { votes: voteType * 2 } });
        }
      }
    } else {
      // Create new vote
      const vote = new Vote({
        user: req.user.userId,
        question: questionId,
        answer: answerId,
        voteType
      });
      await vote.save();
      // Update vote count
      if (questionId) {
        await Question.findByIdAndUpdate(questionId, { $inc: { votes: voteType } });
      } else if (answerId) {
        await Answer.findByIdAndUpdate(answerId, { $inc: { votes: voteType } });
      }
    }

    res.json({ message: 'Vote recorded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept answer
app.post('/api/answers/:id/accept', authenticateToken, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    const question = await Question.findById(answer.question);
    if (question.author.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Only question author can accept answers' });
    }

    // Unaccept all other answers for this question
    await Answer.updateMany(
      { question: answer.question },
      { isAccepted: false }
    );

    // Accept this answer
    answer.isAccepted = true;
    await answer.save();

    res.json({ message: 'Answer accepted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin routes
app.put('/api/users/:id/role', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update user roles' });
    }

    const { role } = req.body;
    if (!['guest', 'user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await User.findByIdAndUpdate(req.params.id, { role });
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete question
app.delete('/api/questions/:id', authenticateToken, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const user = await User.findById(req.user.userId);
    if (question.author.toString() !== req.user.userId && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Question.findByIdAndDelete(req.params.id);
    await Answer.deleteMany({ question: req.params.id });
    await Vote.deleteMany({ question: req.params.id });

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete answer
app.delete('/api/answers/:id', authenticateToken, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    const user = await User.findById(req.user.userId);
    if (answer.author.toString() !== req.user.userId && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Answer.findByIdAndDelete(req.params.id);
    await Vote.deleteMany({ answer: req.params.id });

    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 