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
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ 
          flexGrow: 1, 
          textDecoration: 'none', 
          color: 'inherit' 
        }}>
          StackIt
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {location.pathname !== '/' && (
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/"
              startIcon={<Home />}
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
                >
                  Ask Question
                </Button>
              )}
              
              {user.role === 'admin' && (
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/admin"
                >
                  Admin Panel
                </Button>
              )}
              
              <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                Welcome, {user.username} ({user.role})
              </Typography>
              
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
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