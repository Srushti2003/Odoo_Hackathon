import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import QuestionDetail from './components/QuestionDetail';
import AskQuestion from './components/AskQuestion';
import AdminPanel from './components/AdminPanel';
import { GlobalStyles } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#F6F6F6',
      paper: '#FFFFFF',
    },
    primary: {
      main: '#232323',
      contrastText: '#fff',
    },
    secondary: {
      main: '#FF5A1F',
      contrastText: '#fff',
    },
    accent: {
      main: '#F9B8E2',
    },
    text: {
      primary: '#232323',
      secondary: '#6B6B6B',
    },
    divider: '#E0E0E0',
    warning: {
      main: '#FF5A1F',
    },
    error: {
      main: '#FF5A1F',
    },
    info: {
      main: '#F9B8E2',
    },
    success: {
      main: '#232323',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-1px' },
    h2: { fontWeight: 700, letterSpacing: '-1px' },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    body1: { fontSize: '1.08rem' },
    body2: { fontSize: '0.97rem' },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: '#F6F6F6',
          color: '#232323',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: '#FFFFFF',
          boxShadow: '0 4px 24px 0 rgba(35,35,35,0.04)',
          borderRadius: 16,
          border: '1px solid #E0E0E0',
          padding: '1.5rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#FFFFFF',
          boxShadow: '0 4px 24px 0 rgba(35,35,35,0.06)',
          borderRadius: 16,
          border: '1px solid #E0E0E0',
          padding: '1.5rem',
          transition: 'box-shadow 0.2s, transform 0.2s',
          '&:hover': {
            boxShadow: '0 8px 32px 0 rgba(255,90,31,0.10)',
            transform: 'translateY(-2px) scale(1.01)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#232323',
          borderBottom: '1px solid #E0E0E0',
          boxShadow: '0 2px 8px 0 rgba(35,35,35,0.10)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 24,
          padding: '0.6rem 1.5rem',
          boxShadow: '0 2px 8px 0 rgba(255,90,31,0.10)',
          background: '#FF5A1F',
          color: '#fff',
          transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
          '&:hover': {
            background: '#F9B8E2', // Light pink on hover
            color: '#232323',
            boxShadow: '0 4px 16px 0 rgba(255,90,31,0.18)',
          },
        },
        containedSecondary: {
          background: '#F9B8E2',
          color: '#232323',
          '&:hover': {
            background: '#FF5A1F',
            color: '#fff',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          background: '#F9B8E2',
          color: '#232323',
          borderRadius: 16,
          fontWeight: 500,
          fontSize: '0.95rem',
          padding: '0 10px',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: '#F6F6F6',
          color: '#232323',
          borderRadius: 12,
        },
        input: {
          color: '#232323',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: '#E0E0E0',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#E0E0E0',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#FF5A1F',
          fontWeight: 500,
          textDecoration: 'none',
          transition: 'color 0.2s',
          '&:hover': {
            color: '#F9B8E2',
            textDecoration: 'underline',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          background: 'linear-gradient(90deg, #FF5A1F 60%, #F9B8E2 100%)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '1rem',
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{
        body: { background: '#F6F6F6', color: '#232323' },
        '.MuiPaper-root': { background: '#FFFFFF', borderRadius: 16, boxShadow: '0 4px 24px 0 rgba(35,35,35,0.04)' },
        '.MuiCard-root': { background: '#FFFFFF', borderRadius: 16, boxShadow: '0 4px 24px 0 rgba(35,35,35,0.06)' },
      }} />
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/question/:id" element={<QuestionDetail />} />
              <Route 
                path="/ask" 
                element={
                  <ProtectedRoute allowedRoles={['user', 'admin']}>
                    <AskQuestion />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
