import { useState } from 'react';
import { Box, Dialog, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';
import Navbar from './components/Navbar';
import PdfList from './components/PdfList';
import ChatArea from './components/ChatArea';
import DialogComponent from './components/Dialog'; // Updated to match file name

function App() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null); // null, 'uploading', 'processing', 'done'
  const [theme, setTheme] = useState('dark'); // Default to dark

  // Detect mobile screens (max-width 600px)
  const isMobile = useMediaQuery('(max-width:600px)');

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

  console.log('App render - uploadStatus:', uploadStatus);
  console.log('App render - file:', file);

  return (
    <Box
      sx={{
        bgcolor: theme === 'dark' ? 'black' : 'white',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      {/* Upload Dialog */}
      <Dialog
        open={!uploadStatus || uploadStatus !== 'done'}
        PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none' } }}
        fullWidth
        maxWidth="sm"
        sx={{ backdropFilter: 'blur(5px)', bgcolor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <DialogComponent
          theme={theme}
          onFileChange={handleFileChange}
          onDrop={handleDrop}
          uploadStatus={uploadStatus}
        />
      </Dialog>

      {/* Main Page */}
      {uploadStatus === 'done' &&
        (isMobile ? (
          // Mobile view: Only ChatArea (with pdf bubble inside)
          <ChatArea uploadedFile={file} theme={theme} isMobile={true} />
        ) : (
          // Desktop view: Two-column layout
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'row',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <PdfList uploadedFile={file} theme={theme} />
            <ChatArea uploadedFile={file} theme={theme} isMobile={false} />
          </Box>
        ))}
    </Box>
  );
}

export default App;
