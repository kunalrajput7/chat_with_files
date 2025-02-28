import PropTypes from 'prop-types';
import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  Dialog, 
  DialogTitle, 
  DialogActions, 
  Button 
} from '@mui/material';
import { DarkMode as MoonIcon, LightMode as SunIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function Navbar({ theme, toggleTheme }) {
  const isDark = theme === 'dark';
  const [openLogout, setOpenLogout] = useState(false);

  const handleLogout = () => {
    setOpenLogout(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      setOpenLogout(false);
      // With auth state updated, the main App will redirect to the AuthPage.
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(5px)',
          boxShadow: 'none',
          color: isDark ? 'white' : 'black',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 6 } }}>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontSize: { xs: '1.0rem', sm: '1.2rem' },
            }}
          >
            FileChat
          </Typography>
          <Box>
            <IconButton
              onClick={toggleTheme}
              color="inherit"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              sx={{ p: { xs: 0, sm: 0 } }}
            >
              {isDark ? <MoonIcon /> : <SunIcon />}
            </IconButton>
            <IconButton
              onClick={handleLogout}
              color="inherit"
              aria-label="Logout"
              sx={{ mr: 0, ml: 3 }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Dialog
        open={openLogout}
        onClose={() => setOpenLogout(false)}
        aria-labelledby="logout-dialog-title"
      >
        <DialogTitle id="logout-dialog-title">
          Do you want to logout?
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenLogout(false)} color="primary">
            No
          </Button>
          <Button onClick={confirmLogout} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

Navbar.propTypes = {
  theme: PropTypes.oneOf(['dark', 'light']).isRequired,
  toggleTheme: PropTypes.func.isRequired,
};

export default Navbar;
