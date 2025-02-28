// src/pages/AuthPage.jsx
import { useState } from 'react';
import { Box, Card, CardContent, Button, TextField, Typography, Grid } from '@mui/material';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthPage = () => {
  // authMode: 'login' or 'signup'
  const [authMode, setAuthMode] = useState(null); // initially show both cards as selection
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // On successful login, the auth listener (in App.jsx) will redirect to the main app.
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Store the user's email (and a timestamp) in Firestore.
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date()
      });
      // On successful signup, the auth listener will redirect to the main app.
    } catch (err) {
      setError(err.message);
    }
  };

  // If no card is active, show two selection cards
  if (!authMode) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6}>
            <Card onClick={() => setAuthMode('signup')} sx={{ cursor: 'pointer' }}>
              <CardContent>
                <Typography variant="h5" align="center">
                  Sign Up
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card onClick={() => setAuthMode('login')} sx={{ cursor: 'pointer' }}>
              <CardContent>
                <Typography variant="h5" align="center">
                  Login
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Render the active form
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" align="center">
                {authMode === 'login' ? 'Login' : 'Sign Up'}
              </Typography>
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Password"
                fullWidth
                margin="normal"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={authMode === 'login' ? handleLogin : handleSignup}
              >
                {authMode === 'login' ? 'Login' : 'Sign Up'}
              </Button>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  variant="text"
                  onClick={() =>
                    setAuthMode(authMode === 'login' ? 'signup' : 'login')
                  }
                >
                  {authMode === 'login'
                    ? "Don't have an account? Sign Up"
                    : 'Already have an account? Login'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AuthPage;
