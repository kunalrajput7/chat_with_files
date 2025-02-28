import PropTypes from 'prop-types';
import { useState } from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import HereImage from '../assets/here.png'; // For desktop
import Here2Image from '../assets/here2.png'; // For mobile
import Upload from '../assets/Upload.gif';

function Dialog({ onFileChange, onDrop, uploadStatus }) {
  const [isDragging, setIsDragging] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

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

  // Uploading state: display a centered uploading gif.
  if (uploadStatus === 'uploading' || uploadStatus === 'processing') {
    return (
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.2 }}
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
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mx: 'auto',
        }}
      >
        <img src={Upload} alt="Uploading" style={{ width: 150, height: 150 }} />
      </Box>
    );
  }

  if (isMobile) {
    return (
      <Box sx={{ m: 2 }}>
        {/* Heading outside the dialog box */}
        {/* <Typography variant="h6" align="center" sx={{ mb: 2 }}>
          Upload your PDF to get started.
        </Typography> */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          sx={{
            bgcolor: '#424242',
            borderRadius: '16px',
            p: 3,
            border: '1px solid #616161',
            height: '550px',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" align="center" sx={{ mb: 2 }}>
            Upload your PDF.
          </Typography>
          <Box
            sx={{
              border: '2px dashed #757575',
              borderRadius: '8px',
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: isDragging ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              cursor: uploadStatus ? 'default' : 'pointer',
              transition: 'background-color 0.2s',
              p: 2,
              pb: 0, // remove bottom padding so image touches the edge
            }}
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: '#b0b0b0', mb: 2 }}>
                Tap to upload
              </Typography>
              <AddIcon sx={{ fontSize: 40, mb: 0, color: '#b0b0b0' }} />
            </Box>
            <img
              src={Here2Image}
              alt="Here2"
              style={{ width: '100%', height: 'auto', marginLeft: 40}}
            />
          </Box>
          <input
            type="file"
            accept=".pdf"
            id="fileInput"
            style={{ display: 'none' }}
            onChange={onFileChange}
          />
        </Box>
      </Box>
    );
  }
  

  // Desktop Layout: Two columns with overlap effect
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.2 }}
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
      <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
        {/* Left side: Image */}
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <img src={HereImage} alt="Here" style={{ width: 110, height: 'auto' }} />
        </Box>
        {/* Right side: Column with header text and drag/drop area */}
        <Box
          sx={{
            ml: 0,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {/* <Typography variant="h6" sx={{ alignSelf: 'end', mr: 3 }}>
            Upload your PDF to get started.
          </Typography> */}
          <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 2, mr: 3, alignSelf: 'end' }}>
            Drag or click and start chatting
          </Typography>
          <Box
            sx={{
              border: '2px dashed #757575',
              borderRadius: '8px',
              height: '180px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: isDragging ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              cursor: uploadStatus ? 'default' : 'pointer',
              transition: 'background-color 0.2s',
              ml: -3.2, // Overlap effect with the image
            }}
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Typography variant="body1" sx={{ color: '#b0b0b0' }}>
              DROP your file here or CLICK to upload
            </Typography>
            <input
              type="file"
              accept=".pdf"
              id="fileInput"
              style={{ display: 'none' }}
              onChange={onFileChange}
            />
          </Box>
        </Box>
      </Box>
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
