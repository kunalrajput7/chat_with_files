import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  Paper,
  Avatar,
  CircularProgress,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import axios from 'axios';

function ChatArea({ uploadedFile, theme }) {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleQuery = async () => {
    if (!query) return;
    
    // Create a new user message and a placeholder AI message (with loading state)
    const newUserMsg = { type: 'user', text: query };
    const newAiMsg = { type: 'ai', text: '', loading: true };

    // Update chat history immediately
    setChatHistory((prev) => [...prev, newUserMsg, newAiMsg]);
    const currentQuery = query; // Save the query to use later
    setQuery('');

    // If no PDF is uploaded, update the AI placeholder with an error message
    if (!uploadedFile) {
      setChatHistory((prev) => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          type: 'ai',
          text: 'Please upload a PDF first.',
          loading: false,
        };
        return newHistory;
      });
      return;
    }

    try {
      // Call backend API
      const res = await axios.get(
        `http://127.0.0.1:8000/query?query=${encodeURIComponent(currentQuery)}`
      );
      // Replace the AI placeholder with the actual response
      setChatHistory((prev) => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          type: 'ai',
          text: res.data.response,
          loading: false,
        };
        return newHistory;
      });
    } catch (error) {
      setChatHistory((prev) => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          type: 'ai',
          text:
            'Error: ' +
            (error.response?.data?.error || error.message),
          loading: false,
        };
        return newHistory;
      });
    }
  };

  return (
    <Box
      sx={{
        width: '50%',
        height: 'full',
        bgcolor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
        color: theme === 'dark' ? 'white' : 'black',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
        <List>
          {chatHistory.map((message, index) => (
            <ListItem
              key={index}
              sx={{
                justifyContent:
                  message.type === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {message.type === 'ai' && (
                <Avatar
                  sx={{
                    mr: 1,
                    bgcolor: theme === 'dark' ? '#424242' : '#e0e0e0',
                  }}
                >
                  <SmartToyIcon />
                </Avatar>
              )}
              <Paper
                elevation={1}
                sx={{
                  p: 1,
                  maxWidth: '70%',
                  wordWrap: 'break-word',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  bgcolor:
                    message.type === 'user'
                      ? theme === 'dark'
                        ? '#0288d1'
                        : '#1976d2'
                      : theme === 'dark'
                      ? '#424242'
                      : '#e0e0e0',
                  color: theme === 'dark' ? 'white' : 'black',
                }}
              >
                {message.loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <span>Loading...</span>
                  </Box>
                ) : (
                  message.text
                )}
              </Paper>
              {message.type === 'user' && (
                <Avatar
                  sx={{
                    ml: 1,
                    bgcolor: theme === 'dark' ? '#0288d1' : '#1976d2',
                  }}
                >
                  <PersonIcon />
                </Avatar>
              )}
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          label="Type your question"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
          sx={{
            input: { color: theme === 'dark' ? 'white' : 'black' },
            label: { color: theme === 'dark' ? '#aaa' : '#666' },
            bgcolor: theme === 'dark' ? '#333' : '#fff',
            borderRadius: 1,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: theme === 'dark' ? '#555' : '#ccc',
              },
              '&:hover fieldset': {
                borderColor: theme === 'dark' ? '#777' : '#999',
              },
              '&.Mui-focused fieldset': {
                borderColor: theme === 'dark' ? '#0288d1' : '#1976d2',
              },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleQuery}
          sx={{
            bgcolor: theme === 'dark' ? '#0288d1' : '#1976d2',
            '&:hover': {
              bgcolor: theme === 'dark' ? '#0277bd' : '#1565c0',
            },
          }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
}

ChatArea.propTypes = {
  uploadedFile: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }),
  theme: PropTypes.oneOf(['dark', 'light']).isRequired,
};

export default ChatArea;
