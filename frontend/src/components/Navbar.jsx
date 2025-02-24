import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { DarkMode as MoonIcon, LightMode as SunIcon } from '@mui/icons-material';

function Navbar({ theme, toggleTheme }) {
  const isDark = theme === 'dark';

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(5px)',
        boxShadow: 'none',
        color: isDark ? 'white' : 'black',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontSize: { xs: '1.2rem', sm: '1.5rem' }, // Responsive font size
          }}
        >
          FileChat
        </Typography>
        <Box>
          <IconButton
            onClick={toggleTheme}
            color="inherit"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            sx={{ p: { xs: 0.5, sm: 1 } }} // Smaller padding on mobile
          >
            {isDark ? <MoonIcon /> : <SunIcon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;