import PropTypes from 'prop-types';
import { useState } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText, Paper } from '@mui/material';
import axios from 'axios';

function ChatArea({ uploadedFile, theme }) {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    if (!query) return;
    if (!uploadedFile) {
      setChatHistory([...chatHistory, { question: query, answer: 'Please upload a PDF first.' }]);
      setQuery('');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/query?query=${encodeURIComponent(query)}`);
      setChatHistory([...chatHistory, { question: query, answer: res.data.response }]);
      setQuery('');
    } catch (error) {
      setChatHistory([...chatHistory, { question: query, answer: 'Error: ' + (error.response?.data?.error || error.message) }]);
      setQuery('');
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        width: '50%',
        height: 'calc(100vh - 64px)',
        bgcolor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
        color: theme === 'dark' ? 'white' : 'black',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
        <List>
          {chatHistory.map((entry, index) => (
            <ListItem key={index} sx={{ justifyContent: entry.question ? 'flex-end' : 'flex-start' }}>
              <Paper
                elevation={1}
                sx={{
                  p: 1,
                  maxWidth: '70%',
                  bgcolor: entry.question
                    ? theme === 'dark'
                      ? '#0288d1'
                      : '#1976d2'
                    : theme === 'dark'
                    ? '#424242'
                    : '#e0e0e0',
                  color: entry.question || theme === 'dark' ? 'white' : 'black',
                }}
              >
                <ListItemText primary={entry.question || entry.answer} />
              </Paper>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          label="Type your question"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
          disabled={loading}
          sx={{
            input: { color: theme === 'dark' ? 'white' : 'black' },
            label: { color: theme === 'dark' ? '#aaa' : '#666' },
            bgcolor: theme === 'dark' ? '#333' : '#fff',
            borderRadius: 1,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: theme === 'dark' ? '#555' : '#ccc' },
              '&:hover fieldset': { borderColor: theme === 'dark' ? '#777' : '#999' },
              '&.Mui-focused fieldset': { borderColor: theme === 'dark' ? '#0288d1' : '#1976d2' },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleQuery}
          disabled={loading}
          sx={{ bgcolor: theme === 'dark' ? '#0288d1' : '#1976d2', '&:hover': { bgcolor: theme === 'dark' ? '#0277bd' : '#1565c0' } }}
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