import PropTypes from 'prop-types';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import HelloGif from '../assets/Hello.gif'; // Initial GIF
import UploadGif from '../assets/Upload.gif'; // Uploading GIF

function Dialog({onFileChange, onDrop, uploadStatus }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    onDrop(e);
  };

  const handleClick = () => {
    if (!uploadStatus) {
      document.getElementById('fileInput').click();
    }
  };

  // Debug logs
  console.log('Dialog render - uploadStatus:', uploadStatus);
  console.log('Dialog render - isDragging:', isDragging);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      sx={{
        bgcolor: '#424242',
        borderRadius: '16px',
        p: 3,
        border: '1px solid #616161',
        width: '100%',
        maxWidth: '500px',
        color: 'white',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {uploadStatus === 'uploading' || uploadStatus === 'processing' ? (
        <img
          src={UploadGif}
          alt="Uploading"
          style={{ width: 150, height: 150 }}
        />
      ) : (
        <>
          {/* Top Row: GIF + Text */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <img
              src={HelloGif}
              alt="Hello"
              style={{ width: 100, height: 100 }}
            />
            <Box sx={{ ml: 2 }}>
              <Typography variant="h6">Upload Your PDF</Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                Drag or click to start chatting
              </Typography>
            </Box>
          </Box>

          {/* Drag/Drop Area */}
          <Box
            sx={{
              border: '2px dashed #757575',
              borderRadius: '8px',
              height: '150px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: isDragging ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              cursor: uploadStatus ? 'default' : 'pointer',
              transition: 'background-color 0.2s',
            }}
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Typography variant="body1" sx={{ color: '#b0b0b0' }}>
              Drop your PDF here or click to upload
            </Typography>
            <input
              type="file"
              accept=".pdf"
              id="fileInput"
              style={{ display: 'none' }}
              onChange={onFileChange}
            />
          </Box>
        </>
      )}
    </Box>
  );
}

Dialog.propTypes = {
  theme: PropTypes.oneOf(['dark', 'light']).isRequired,
  onFileChange: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
  uploadStatus: PropTypes.oneOf(['uploading', 'processing', 'done', null]),
};

export default Dialog;