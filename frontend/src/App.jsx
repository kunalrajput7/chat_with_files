import { useState } from 'react';
import { Box, Dialog, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';
import Navbar from './components/Navbar';
import PdfList from './components/PdfList';
import ChatArea from './components/ChatArea';

function App() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null); // null, 'uploading', 'processing', 'done'
  const [theme, setTheme] = useState('dark'); // Default to dark

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      handleUpload(selectedFile);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      handleUpload(droppedFile);
    }
  };

  const handleUpload = async (uploadFile) => {
    setUploadStatus('uploading');
    const formData = new FormData();
    formData.append('file', uploadFile);
    try {
      setUploadStatus('processing');
      await axios.post('http://127.0.0.1:8000/upload_pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadStatus('done');
    } catch (error) {
      setUploadStatus(null);
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const preventDefault = (event) => event.preventDefault();

  return (
    <Box
      sx={{
        bgcolor: theme === 'dark' ? 'black' : 'white',
        height: '100vh', // Fixed height to viewport
        width: '100vw', // Fixed width to viewport
        overflow: 'hidden', // Prevent outer scroll
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      {/* Dialog for Upload */}
      <Dialog
        open={!uploadStatus || uploadStatus !== 'done'}
        PaperProps={{
          sx: {
            bgcolor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(5px)',
            p: 4,
          },
        }}
        fullWidth
        maxWidth="sm"
        component={motion.div}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <Box
          sx={{
            textAlign: 'center',
            color: theme === 'dark' ? 'white' : 'black',
            cursor: uploadStatus ? 'default' : 'pointer',
          }}
          onClick={!uploadStatus ? () => document.getElementById('fileInput').click() : null}
          onDrop={handleDrop}
          onDragOver={preventDefault}
          onDragEnter={preventDefault}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            Upload a PDF to get started
          </Typography>
          {uploadStatus === 'uploading' || uploadStatus === 'processing' ? (
            <>
              <CircularProgress sx={{ color: theme === 'dark' ? 'white' : 'black' }} />
              <Typography sx={{ mt: 2 }}>
                {uploadStatus === 'uploading' ? 'Uploading...' : 'Processing...'}
              </Typography>
            </>
          ) : (
            <motion.img
              src="https://cdn-icons-png.flaticon.com/512/32/32339.png"
              alt="Upload"
              width={64}
              height={64}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            />
          )}
          <input
            type="file"
            accept=".pdf"
            id="fileInput"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </Box>
      </Dialog>

      {/* Main Page */}
      {uploadStatus === 'done' && (
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{
            flexGrow: 1, // Takes remaining space after navbar
            display: 'flex',
            flexDirection: 'row',
            height: 'calc(100vh - 64px)', // Exact height after navbar
            overflow: 'hidden', // No scroll here either
          }}
        >
          <PdfList uploadedFile={file} theme={theme} />
          <ChatArea uploadedFile={file} theme={theme} />
        </Box>
      )}
    </Box>
  );
}

export default App;