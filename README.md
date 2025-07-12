# StackIt - Q&A Platform

A minimal question-and-answer platform that supports collaborative learning and structured knowledge sharing. Built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

### User Roles
- **Guest**: View all questions and answers
- **User**: Register, log in, post questions/answers, vote
- **Admin**: Moderate content, manage users, delete questions/answers

### Core Features
- ✅ User authentication and authorization
- ✅ Ask and answer questions
- ✅ Vote on questions and answers
- ✅ Accept answers as correct
- ✅ Search and filter questions
- ✅ Tag-based categorization
- ✅ Responsive Material-UI design
- ✅ Real-time voting updates
- ✅ Admin panel for content moderation

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Material-UI** - Component library
- **Axios** - HTTP client
- **Context API** - State management

## Project Structure

```
Odoo_Hackathon/
├── backend/
│   ├── server.js          # Main Express server
│   ├── package.json       # Backend dependencies
│   └── config.env         # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── App.js         # Main app component
│   └── package.json       # Frontend dependencies
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/stackit
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user

### Questions
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create a new question (authenticated)
- `GET /api/questions/:id` - Get a specific question
- `DELETE /api/questions/:id` - Delete a question (author/admin only)

### Answers
- `POST /api/questions/:id/answers` - Create an answer (authenticated)
- `POST /api/answers/:id/accept` - Accept an answer (question author only)
- `DELETE /api/answers/:id` - Delete an answer (author/admin only)

### Voting
- `POST /api/vote` - Vote on questions or answers (authenticated)

### Admin
- `PUT /api/users/:id/role` - Update user role (admin only)

## Usage

### For Guests
- Browse all questions and answers
- Search and filter questions
- View question details and answers

### For Users
- All guest features
- Register and login
- Ask questions with tags
- Answer questions
- Vote on questions and answers
- Accept answers to your questions

### For Admins
- All user features
- Access admin panel
- Delete any question or answer
- Moderate content
- Manage user roles

## Database Schema

### User
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String (guest/user/admin),
  createdAt: Date
}
```

### Question
```javascript
{
  title: String,
  content: String,
  author: ObjectId (ref: User),
  tags: [String],
  votes: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Answer
```javascript
{
  content: String,
  author: ObjectId (ref: User),
  question: ObjectId (ref: Question),
  votes: Number,
  isAccepted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Vote
```javascript
{
  user: ObjectId (ref: User),
  question: ObjectId (ref: Question),
  answer: ObjectId (ref: Answer),
  voteType: Number (1 or -1),
  createdAt: Date
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Future Enhancements

- [ ] Real-time notifications
- [ ] Rich text editor for questions/answers
- [ ] User profiles and reputation system
- [ ] Question categories and advanced filtering
- [ ] Email notifications
- [ ] Mobile app
- [ ] API documentation with Swagger
- [ ] Unit and integration tests
