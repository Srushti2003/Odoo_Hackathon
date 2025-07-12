import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home } from '@mui/icons-material';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar sx={{ 
        minHeight: '70px', 
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <img src="/StackItLogo.png" alt="StackIt Logo" style={{ height: 60, marginRight: 0 }} />
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {location.pathname !== '/' && (
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/"
              startIcon={<Home />}
              sx={{ 
                fontWeight: 500,
                textTransform: 'none',
                px: 2
              }}
            >
              Home
            </Button>
          )}
          
          {user ? (
            <>
              {user.role !== 'guest' && (
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/ask"
                  sx={{ 
                    fontWeight: 500,
                    textTransform: 'none',
                    px: 2
                  }}
                >
                  Ask Question
                </Button>
              )}
              
              {user.role === 'admin' && (
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/admin"
                  sx={{ 
                    fontWeight: 500,
                    textTransform: 'none',
                    px: 2
                  }}
                >
                  Admin Panel
                </Button>
              )}
              
              <Typography 
                variant="body2" 
                sx={{ 
                  alignSelf: 'center',
                  fontWeight: 500,
                  px: 2,
                  py: 1,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 1,
                  mx: 1
                }}
              >
                Welcome, {user.username} ({user.role})
              </Typography>
              
              <Button 
                color="inherit" 
                onClick={handleLogout}
                sx={{ 
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 2
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/login"
                sx={{ 
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 2
                }}
              >
                Login
              </Button>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/register"
                sx={{ 
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 2
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 