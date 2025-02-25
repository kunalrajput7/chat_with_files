import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';

// Set worker source to a CDN (stable version) or local file
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

function PdfList({ uploadedFile, theme }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Create PDF URL and cleanup
  useEffect(() => {
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPdfUrl(null);
    }
  }, [uploadedFile]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setCurrentPage(1); // Reset to first page on new PDF
  };

  // Handle scroll to determine current page
  const handleScroll = (event) => {
    const container = event.target;
    const pageHeight = container.scrollHeight / numPages;
    const scrollPosition = container.scrollTop;
    const newPage = Math.max(1, Math.min(numPages, Math.ceil(scrollPosition / pageHeight) + 1));
    setCurrentPage(newPage);
  };

  return (
    <Box
      sx={{
        width: '50%',
        height: '100%',
        bgcolor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
        color: theme === 'dark' ? 'white' : 'black',
        position: 'relative',
        overflow: 'hidden',
        paddingLeft: 5,
        paddingRight: 5,
      }}
    >
      {uploadedFile && pdfUrl ? (
        <>
          {/* PDF Name Bubble - Centered Top */}
          {/* <Button
            sx={{
              position: 'absolute',
              bottom: 10,
              right: '50%',
              transform: 'translateX(-50%)',
              bgcolor: theme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
              color: theme === 'dark' ? 'white' : 'black',
              zIndex: 1,
              borderRadius: '15px',
              px: 2,
              '&:hover': {
                bgcolor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              },
              fontSize: 10,
            }}
          >
            {uploadedFile.name}
          </Button> */}

          {/* PDF Content */}
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
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<Typography>Loading PDF...</Typography>}
              error={<Typography>Error loading PDF.</Typography>}
            >
              {Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                //   width={Math.min(400, window.innerWidth * 0.45)}
                // width={}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              ))}
            </Document>
          </Box>

          {/* Page Number Bubble - Centered Bottom */}
          {numPages && (
            <Button
              sx={{
                position: 'absolute',
                bottom: 10,
                left: '50%',
                transform: 'translateX(-50%)',
                bgcolor: 'rgba(0, 0, 0, 0.65)',
                color: 'white',
                zIndex: 1,
                borderRadius: '20px',
                px: 2,
                // '&:hover': {
                //   bgcolor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                // },
                fontSize: 10,
              }}
            >
              Page {currentPage} of {numPages}
            </Button>
          )}
        </>
      ) : (
        <Typography sx={{ p: 2 }}>No PDF uploaded yet.</Typography>
      )}
    </Box>
  );
}

PdfList.propTypes = {
  uploadedFile: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }),
  theme: PropTypes.oneOf(['dark', 'light']).isRequired,
};

export default PdfList;