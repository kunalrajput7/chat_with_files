// src/components/PdfPreview.jsx
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

function PdfPreview({ uploadedFile, theme }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate container width
  useEffect(() => {
    const updateWidth = () => {
      const container = document.getElementById('pdf-container');
      if (container) {
        setContainerWidth(container.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Reset state when new file is selected
  useEffect(() => {
    setLoading(true);
    setError(null);
    setNumPages(null);
    setCurrentPage(1);
  }, [uploadedFile]);

  const handleLoadSuccess = ({ numPages }) => {
    setLoading(false);
    setNumPages(numPages);
  };

  const handleLoadError = (error) => {
    console.error('PDF load error:', error);
    setLoading(false);
    setError('Failed to load PDF');
  };

  const handleScroll = (event) => {
    if (!numPages) return;
    
    const container = event.target;
    const pageHeight = container.scrollHeight / numPages;
    const scrollPosition = container.scrollTop;
    const newPage = Math.max(1, Math.min(numPages, Math.ceil(scrollPosition / pageHeight) + 1));
    setCurrentPage(newPage);
  };

  return (
    <Box
      id="pdf-container"
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {uploadedFile?.downloadURL ? (
        <>
          <Box
            onScroll={handleScroll}
            sx={{
              width: '100%',
              height: '100%',
              overflowY: 'auto',
              bgcolor: theme === 'dark' ? '#333' : '#fff',
            }}
          >
            <Document
              file={uploadedFile.downloadURL}
              onLoadSuccess={handleLoadSuccess}
              onLoadError={handleLoadError}
              loading={
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                  <CircularProgress />
                </Box>
              }
            >
              {Array.from({ length: numPages }, (_, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={containerWidth - 32} // Add some padding
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading={
                    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                      <CircularProgress />
                    </Box>
                  }
                />
              ))}
            </Document>
          </Box>

          {error && (
            <Typography color="error" sx={{ p: 2, textAlign: 'center' }}>
              {error}
            </Typography>
          )}

          {numPages && (
            <Button
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                bgcolor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                borderRadius: '20px',
                px: 3,
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' }
              }}
            >
              Page {currentPage} of {numPages}
            </Button>
          )}
        </>
      ) : (
        <Typography sx={{ p: 2, textAlign: 'center' }}>
          {uploadedFile ? 'Invalid PDF URL' : 'No PDF selected'}
        </Typography>
      )}
    </Box>
  );
}

PdfPreview.propTypes = {
  uploadedFile: PropTypes.shape({
    fileName: PropTypes.string,
    downloadURL: PropTypes.string,
  }),
  theme: PropTypes.oneOf(['dark', 'light']).isRequired,
};

export default PdfPreview;