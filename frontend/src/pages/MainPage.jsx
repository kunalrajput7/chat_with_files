// src/pages/MainPage.jsx
import { useState, useEffect } from "react";
import { Box, useMediaQuery, Toolbar } from "@mui/material";
// import { motion } from 'framer-motion';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import PdfList from "../components/PdfPreview";
import ChatArea from "../components/ChatArea";
import DialogComponent from "../components/Dialog";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, storage, db } from "../firebase";

function MainPage() {
  // selectedFile holds the file object (with downloadURL etc.) from Firestore
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null); // 'uploading', 'processing', 'done'
  const [theme, setTheme] = useState("dark");
  const isMobile = useMediaQuery("(max-width:600px)");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const handleNewChat = () => {
    setSelectedFile(null);
  };

  const handleFileChange = async (event) => {
    const fileObj = event.target.files[0];
    if (!fileObj) return;

    setUploadStatus("uploading");
    const user = auth.currentUser;
    if (!user) {
      alert("User not logged in");
      return;
    }

    const storageRef = ref(storage, `users/${user.uid}/files/${fileObj.name}`);
    try {
      await uploadBytes(storageRef, fileObj);
      const downloadURL = await getDownloadURL(storageRef);
      const fileData = {
        fileName: fileObj.name,
        downloadURL,
        uploadedAt: serverTimestamp(),
      };
      const docRef = await addDoc(
        collection(db, "users", user.uid, "files"),
        fileData
      );
      // Set the selected file using the Firestore document data
      setSelectedFile({ id: docRef.id, ...fileData });
      setUploadStatus("done");
    } catch (error) {
      console.error("Error uploading file: ", error);
      setUploadStatus(null);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      handleFileChange({ target: { files: [droppedFile] } });
    }
  };

  return (
    <Box
      sx={{
        bgcolor: theme === "dark" ? "black" : "white",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Fixed Navbar */}
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        onToggleSidebar={toggleSidebar}
      />
      <Toolbar /> {/* Spacer */}
      {/* Always show sidebar and main content area */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          height: "calc(100vh - 64px)", // Subtract navbar height
        }}
      >
        {/* Conditional rendering for mobile sidebar */}
        {(sidebarOpen || !isMobile) && (
          <Sidebar
            theme={theme}
            onSelectFile={(file) => {
              setSelectedFile(file);
              if (isMobile) setSidebarOpen(false); // Close sidebar on mobile selection
            }}
            selectedFileId={selectedFile?.id}
            isMobile={isMobile}
            onClose={() => setSidebarOpen(false)}
            sx={{
              transform: isMobile
                ? sidebarOpen
                  ? "translateX(0)"
                  : "translateX(-100%)"
                : "none",
            }}
            handleNewChat={handleNewChat}
          />
        )}

        {/* Main Content Area */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            bgcolor: theme === "dark" ? "#1a1a1a" : "#f5f5f5",
          }}
        >
          {selectedFile ? (
            // Existing PDF Preview & Chat Area
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              <PdfList uploadedFile={selectedFile} theme={theme} />
              <ChatArea
                uploadedFile={selectedFile}
                theme={theme}
                isMobile={isMobile}
              />
            </Box>
          ) : (
            // Show Upload Dialog in the main content area
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
              }}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <DialogComponent
                theme={theme}
                onFileChange={handleFileChange}
                onDrop={handleDrop}
                uploadStatus={uploadStatus}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default MainPage;
