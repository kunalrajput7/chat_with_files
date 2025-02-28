// src/pages/MainPage.jsx
import { useState } from 'react';
import { Box, Dialog, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import PdfList from '../components/PdfList';
import ChatArea from '../components/ChatArea';
import DialogComponent from '../components/Dialog';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, storage, db } from '../firebase';

function MainPage() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null); // 'uploading', 'processing', 'done'
  const [theme, setTheme] = useState('dark');
  const isMobile = useMediaQuery('(max-width:600px)');

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setUploadStatus('uploading');
    const user = auth.currentUser;
    if (!user) {
      alert("User not logged in");
      return;
    }

    // Create a storage reference for this file.
    const storageRef = ref(storage, `users/${user.uid}/files/${selectedFile.name}`);
    try {
      // Upload the file to Firebase Storage.
      await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(storageRef);

      // Save file details in Firestore under a subcollection "files" in the user's document.
      const fileData = {
        fileName: selectedFile.name,
        downloadURL,
        uploadedAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'users', user.uid, 'files'), fileData);

      setFile(selectedFile);
      setUploadStatus('done');
    } catch (error) {
      console.error("Error uploading file: ", error);
      setUploadStatus(null);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      handleFileChange({ target: { files: [droppedFile] } });
    }
  };

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

      {/* Main Content */}
      {uploadStatus === 'done' &&
        (isMobile ? (
          <ChatArea uploadedFile={file} theme={theme} isMobile={true} />
        ) : (
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

export default MainPage;
