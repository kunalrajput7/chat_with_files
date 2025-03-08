import { useState, useEffect, } from "react";
import { Box, useMediaQuery, Toolbar, CircularProgress } from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import PdfList from "../components/PdfPreview";
import ChatArea from "../components/ChatArea";
import DialogComponent from "../components/Dialog";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, query, onSnapshot } from "firebase/firestore";
import { auth, storage, db } from "../firebase";

function MainPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userFiles, setUserFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width:600px)");

  // Fetch user files
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const q = query(
          collection(db, "users", user.uid, "files"),
        //   orderBy("uploadedAt", "desc")
        );
        
        const unsubscribeFiles = onSnapshot(q, (snapshot) => {
          const fileData = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            uploadedAt: doc.data().uploadedAt?.toDate() 
          }));
          setUserFiles(fileData);
          setLoading(false);
        });

        return () => unsubscribeFiles();
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleNewChat = () => setSelectedFile(null);

  const handleFileChange = async (event) => {
    const fileObj = event.target.files[0];
    if (!fileObj) return;

    setUploadStatus("uploading");
    const user = auth.currentUser;
    if (!user) {
      alert("User not logged in");
      return;
    }

    try {
      const storageRef = ref(storage, `users/${user.uid}/files/${fileObj.name}`);
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
      
      setSelectedFile({ id: docRef.id, ...fileData });
      setUploadStatus("done");
    } catch (error) {
      console.error("Error uploading file: ", error);
      setUploadStatus(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Add this function inside your MainPage component
const handleSelectFile = async (file) => {
  try {
    // Call backend to load the selected PDF
    const response = await fetch('http://localhost:8000/load_pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        download_url: file.downloadURL
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to load PDF');
    }

    // If successful, update the selected file
    setSelectedFile(file);
    if (isMobile) setSidebarOpen(false);
  } catch (error) {
    console.error('Error loading PDF:', error);
    alert('Failed to load PDF. Please try again.');
  }
};

  return (
    <Box sx={{
      bgcolor: theme === "dark" ? "black" : "white",
      height: "100vh",
      width: "100vw",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        onToggleSidebar={toggleSidebar}
      />
      <Toolbar />

      <Box sx={{
        flexGrow: 1,
        display: "flex",
        height: "calc(100vh - 64px)",
      }}>
        {(sidebarOpen || !isMobile) && (
          <Sidebar
            theme={theme}
            files={userFiles}
            selectedFileId={selectedFile?.id}
            onSelectFile={handleSelectFile}
            isMobile={isMobile}
            onClose={() => setSidebarOpen(false)}
            handleNewChat={handleNewChat}
          />
        )}

        <Box sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
        }}>
          {selectedFile ? (
            <>
              <PdfList 
                uploadedFile={selectedFile} 
                theme={theme} 
              />
              <ChatArea
                uploadedFile={selectedFile}
                theme={theme}
                isMobile={isMobile}
              />
            </>
          ) : (
            <Box sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
            }}>
              <DialogComponent
                theme={theme}
                onFileChange={handleFileChange}
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