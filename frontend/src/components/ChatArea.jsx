import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, List, ListItem, Paper, Avatar, CircularProgress, Dialog, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import axios from 'axios';
import PdfList from './PdfList';
import PdfIcon from '../assets/pdf_icon.png'; // Import the PDF icon
import SendIcon from '../assets/send.png';

function ChatArea({ uploadedFile, theme, isMobile }) {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleQuery = async () => {
    if (!query) return;
    
    const newUserMsg = { type: 'user', text: query };
    const newAiMsg = { type: 'ai', text: '', loading: true };

    setChatHistory((prev) => [...prev, newUserMsg, newAiMsg]);
    const currentQuery = query;
    setQuery('');

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
      const res = await axios.get(
        `http://127.0.0.1:8000/query?query=${encodeURIComponent(currentQuery)}`
      );
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
        width: isMobile ? '100%' : '50%',
        height: '100%',
        bgcolor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
        color: theme === 'dark' ? 'white' : 'black',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative', // Added for positioning the PDF bubble
      }}
    >
      {/* PDF Preview Bubble (Top Position) */}
      {isMobile && uploadedFile && (
  <Box
    onClick={() => setShowPdfPreview(true)}
    sx={{
      position: 'sticky', // Changed from absolute to sticky
      top: 65, // Adjusted to account for navbar height
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      borderRadius: '16px',
      px: 1,
      py: 1,
      cursor: 'pointer',
      zIndex: 1000, // Ensure it's above other elements
      backdropFilter: 'blur(10px)', // For glass effect
      border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
      width: '90%', // Fixed width
      maxWidth: '200px', // Maximum width
      display: 'flex',
      alignItems: 'center',
      gap: 2, // Space between icon and text
    }}
  >
    {/* PDF Icon */}
    <Box
      component="img"
      src={PdfIcon}
      alt="PDF Icon"
      sx={{
        width: 34,
        height: 34,
        margin: 0,
      }}
    />

    {/* PDF Name */}
    <Typography
      variant="body2"
      sx={{
        color: theme === 'dark' ? 'white' : 'black',
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2, // Limit to 2 lines
        WebkitBoxOrient: 'vertical',
        wordBreak: 'break-word', // Break long words
      }}
    >
      {uploadedFile.name}
    </Typography>
  </Box>
)}

      {/* Chat Messages Area */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column-reverse',
          pt: isMobile && uploadedFile ? 8 : 0, // Add padding to avoid overlap
        }}
      >
        <List>
          {chatHistory.map((message, index) => (
            <ListItem
              key={index}
              sx={{
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
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

      {/* Input Section */}
      <Box sx={{ display: 'flex', gap: 0.5, mt: 1 , p: 1, pb: 0,}}>
  <TextField
    fullWidth
    label="Type your question..."
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
  <IconButton
    onClick={handleQuery}
    sx={{
      p: 1, // Adjust padding as needed
      '&:hover': {
        backgroundColor: theme === 'dark' ? 'rgba(2, 136, 209, 0.1)' : 'rgba(25, 118, 210, 0.1)', // Subtle hover effect
      },
    }}
  >
    <Box
      component="img"
      src={SendIcon}
      alt="Send"
      sx={{
        p: 0,
        width: 34, // Adjust size as needed
        height: 34,
      }}
    />
  </IconButton>
</Box>

      {/* Mobile: PDF Preview Modal */}
      {isMobile && (
        <Dialog open={showPdfPreview} onClose={() => setShowPdfPreview(false)} fullWidth maxWidth="md">
          <PdfList uploadedFile={uploadedFile} theme={theme} />
        </Dialog>
      )}
    </Box>
  );
}

ChatArea.propTypes = {
  uploadedFile: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }),
  theme: PropTypes.oneOf(['dark', 'light']).isRequired,
  isMobile: PropTypes.bool,
};

ChatArea.defaultProps = {
  isMobile: false,
};

export default ChatArea;