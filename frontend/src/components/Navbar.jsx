import PropTypes from 'prop-types'; // Add this import
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { DarkMode as MoonIcon, LightMode as SunIcon } from '@mui/icons-material';

function Navbar({ theme, toggleTheme }) {
  const isDark = theme === 'dark';

  return (
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
        </Box>
      </Toolbar>
    </AppBar>
  );
}

// Add prop types validation
Navbar.propTypes = {
  theme: PropTypes.oneOf(['dark', 'light']).isRequired,
  toggleTheme: PropTypes.func.isRequired,
};

export default Navbar;