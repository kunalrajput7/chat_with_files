// src/components/ChatArea.jsx
import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  Paper,
  Avatar,
  CircularProgress,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import axios from "axios";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import PdfIcon from "../assets/pdf_icon.png";
import SendIcon from "../assets/send.png";

function ChatArea({ uploadedFile, theme, isMobile }) {
  const [queryText, setQueryText] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [animatedText, setAnimatedText] = useState(""); // For typewriter-style animation
  const messagesEndRef = useRef(null);

  // Set up a Firestore listener to fetch chat history for the selected PDF.
  useEffect(() => {
    if (!uploadedFile || !auth.currentUser) {
      setChatHistory([]);
      return;
    }

    const chatRef = collection(
      db,
      "users",
      auth.currentUser.uid,
      "files",
      uploadedFile.id,
      "chats"
    );
    const q = query(chatRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chats = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChatHistory(chats);
      },
      (error) => {
        console.error("Error fetching chat history: ", error);
      }
    );
    return () => unsubscribe();
  }, [uploadedFile]);

  // Auto-scroll to the bottom when chat history updates.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Typing animation for the latest AI response.
  useEffect(() => {
    if (chatHistory.length === 0) return;
    const latestMessage = chatHistory[chatHistory.length - 1];
    if (latestMessage?.role === "assistant" && !latestMessage.loading) {
      const words = latestMessage.message.split(" ");
      let currentIndex = 0;
      setAnimatedText(""); // Reset animation text
      const interval = setInterval(() => {
        if (currentIndex < words.length) {
          setAnimatedText((prev) => prev + " " + words[currentIndex]);
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 50); // Adjust speed (lower = faster)
      return () => clearInterval(interval);
    }
  }, [chatHistory]);

  // Check if AI is currently responding.
  const isAIResponding = chatHistory.some(
    (message) => message.role === "assistant" && message.loading
  );

  // Function to handle sending a query.
  const handleQuery = async () => {
    if (!queryText || isAIResponding) return;
    if (!uploadedFile || !auth.currentUser) return;

    // Reference to the chats subcollection for the selected PDF.
    const chatRef = collection(
      db,
      "users",
      auth.currentUser.uid,
      "files",
      uploadedFile.id,
      "chats"
    );

    // Create message objects for the user and a placeholder for the AI.
    const newUserMsg = {
      role: "user",
      message: queryText,
      timestamp: serverTimestamp(),
    };
    const newAiMsg = {
      role: "assistant",
      message: "",
      loading: true,
      timestamp: serverTimestamp(),
    };

    try {
      // Add the user's message.
      await addDoc(chatRef, newUserMsg);
      // Add the AI placeholder message and capture its document reference.
      const aiDocRef = await addDoc(chatRef, newAiMsg);

      // Clear the input.
      setQueryText("");

      // Send the query to the backend.
      const res = await axios.get(
        `http://127.0.0.1:8000/query?query=${encodeURIComponent(queryText)}`
      );

      // Update the AI placeholder document with the response.
      await updateDoc(
        doc(
          db,
          "users",
          auth.currentUser.uid,
          "files",
          uploadedFile.id,
          "chats",
          aiDocRef.id
        ),
        {
          message: res.data.response,
          loading: false,
          timestamp: serverTimestamp(),
        }
      );
    } catch (error) {
      console.error("Error sending query: ", error);
      // Optionally update the AI message with an error message.
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderLeft: isMobile ? "none" : `1px solid ${theme === "dark" ? "#333" : "#eee"}`,
      }}
    >
      {/* PDF Preview Bubble (Mobile Only) */}
      {isMobile && uploadedFile && (
        <Box
          sx={{
            position: "fixed",
            top: 65, // Adjust for navbar height
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
            borderRadius: "16px",
            px: 1,
            py: 1,
            cursor: "pointer",
            zIndex: 1000,
            backdropFilter: "blur(10px)",
            border: `1px solid ${theme === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"}`,
            width: "90%",
            maxWidth: "200px",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
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
          <Typography
            variant="body2"
            sx={{
              color: theme === "dark" ? "white" : "black",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              wordBreak: "break-word",
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
          overflowY: "auto",
          display: "flex",
          flexDirection: "column-reverse",
          pt: isMobile && uploadedFile ? 8 : 0, // Padding to avoid overlap with floating bubble
        }}
      >
        <List>
          {chatHistory.map((message, index) => (
            <ListItem
              key={index}
              sx={{
                justifyContent:
                  message.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {message.role === "assistant" && (
                <Avatar
                  sx={{
                    mr: 1,
                    bgcolor: theme === "dark" ? "#424242" : "#e0e0e0",
                  }}
                >
                  <SmartToyIcon />
                </Avatar>
              )}
              <Paper
                elevation={1}
                sx={{
                  p: 1,
                  maxWidth: "70%",
                  wordWrap: "break-word",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  bgcolor:
                    message.role === "user"
                      ? theme === "dark"
                        ? "#0288d1"
                        : "#1976d2"
                      : theme === "dark"
                      ? "#424242"
                      : "#e0e0e0",
                  color: theme === "dark" ? "white" : "black",
                }}
              >
                {message.loading ? (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <span>Thinking...</span>
                  </Box>
                ) : (
                  // For the latest AI message, show animatedText; otherwise, show stored message.
                  index === chatHistory.length - 1 && message.role === "assistant"
                    ? animatedText
                    : message.message
                )}
              </Paper>
              {message.role === "user" && (
                <Avatar
                  sx={{
                    ml: 1,
                    bgcolor: theme === "dark" ? "#0288d1" : "#1976d2",
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
      <Box sx={{ display: "flex", gap: 0.5, mt: 1, p: 1, pb: 0 }}>
        <TextField
          fullWidth
          label="Type your question..."
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          onKeyPress={(e) =>
            e.key === "Enter" && !isAIResponding && handleQuery()
          }
          sx={{
            input: { color: theme === "dark" ? "white" : "black" },
            label: { color: theme === "dark" ? "#aaa" : "#666" },
            bgcolor: theme === "dark" ? "#333" : "#fff",
            borderRadius: 1,
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: theme === "dark" ? "#555" : "#ccc",
              },
              "&:hover fieldset": {
                borderColor: theme === "dark" ? "#777" : "#999",
              },
              "&.Mui-focused fieldset": {
                borderColor: theme === "dark" ? "#0288d1" : "#1976d2",
              },
            },
          }}
        />
        <IconButton
          onClick={handleQuery}
          disabled={isAIResponding}
          sx={{
            p: 1,
            "&:hover": {
              backgroundColor:
                theme === "dark"
                  ? "rgba(2, 136, 209, 0.1)"
                  : "rgba(25, 118, 210, 0.1)",
            },
            "&:disabled": {
              opacity: 0.5,
            },
          }}
        >
          <Box
            component="img"
            src={SendIcon}
            alt="Send"
            sx={{
              p: 0,
              width: 34,
              height: 34,
              filter: isAIResponding ? "grayscale(1)" : "none",
            }}
          />
        </IconButton>
      </Box>
    </Box>
  );
}

ChatArea.propTypes = {
  uploadedFile: PropTypes.shape({
    id: PropTypes.string.isRequired, // Added to validate the file id
    name: PropTypes.string.isRequired,
    downloadURL: PropTypes.string,
  }),
  theme: PropTypes.oneOf(["dark", "light"]).isRequired,
  isMobile: PropTypes.bool,
};

ChatArea.defaultProps = {
  isMobile: false,
};

export default ChatArea;
