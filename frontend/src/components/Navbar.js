import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Badge, Menu, MenuItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Notifications as NotificationsIcon, ArrowBack, QuestionAnswer, Comment, AlternateEmail } from '@mui/icons-material';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Fetch notifications for logged-in user
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        try {
          const token = localStorage.getItem('token');
          console.log('Fetching notifications for user:', user.username, 'Token:', token ? 'Present' : 'Missing');
          
          const res = await axios.get('http://localhost:5000/api/notifications', {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Notifications response:', res.data);
          setNotifications(res.data.notifications);
          setUnreadCount(res.data.unreadCount);
        } catch (err) {
          console.error('Error fetching notifications:', err);
        }
      }
    };
    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Mark notifications as read when dropdown is opened
  const handleBellClick = async (event) => {
    setAnchorEl(event.currentTarget);
    if (unreadCount > 0) {
      try {
        await axios.post('http://localhost:5000/api/notifications/mark-read', {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUnreadCount(0);
        // Optionally update notifications to mark as read
        setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
      } catch (err) {
        console.error('Error marking notifications as read:', err);
      }
    }
  };
  const handleBellClose = () => setAnchorEl(null);

  const handleNotificationClick = async (notif) => {
    handleBellClose();
    if (notif.link) navigate(notif.link);
    // Remove from DB and UI
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${notif._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications((prev) => prev.filter(n => n._id !== notif._id));
      setUnreadCount((prev) => Math.max(0, prev - (notif.read ? 0 : 1)));
    } catch (err) {
      setNotifications((prev) => prev.filter(n => n._id !== notif._id));
      setUnreadCount((prev) => Math.max(0, prev - (notif.read ? 0 : 1)));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Helper to get icon for notification type
  const getNotifIcon = (type) => {
    if (type === 'answer') return <QuestionAnswer fontSize="small" color="primary" />;
    if (type === 'comment') return <Comment fontSize="small" color="secondary" />;
    if (type === 'mention') return <AlternateEmail fontSize="small" color="info" />;
    return null;
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
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Notification Bell */}
          {user && (
            <>
              <IconButton color="inherit" onClick={handleBellClick} sx={{ position: 'relative' }}>
                <Badge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleBellClose}
                PaperProps={{ sx: { minWidth: 320, maxWidth: 400 } }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Box sx={{ px: 2, py: 1, fontWeight: 600 }}>Notifications</Box>
                <Divider />
                {notifications.length === 0 && (
                  <MenuItem disabled>No notifications</MenuItem>
                )}
                {notifications.map((notif, idx) => (
                  <MenuItem 
                    key={notif._id || idx} 
                    onClick={() => handleNotificationClick(notif)}
                    sx={{ background: !notif.read ? 'rgba(255,90,31,0.08)' : 'inherit' }}
                  >
                    <ListItemIcon>{getNotifIcon(notif.type)}</ListItemIcon>
                    <ListItemText 
                      primary={notif.message} 
                      secondary={new Date(notif.createdAt).toLocaleString()} 
                      primaryTypographyProps={{ fontWeight: !notif.read ? 600 : 400 }}
                    />
                  </MenuItem>
                ))}
              </Menu>
            </>
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