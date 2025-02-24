import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

function PdfList({ uploadedFile, theme }) {
  return (
    <Box
      sx={{
        width: '50%',
        height: 'calc(100vh - 64px)',
        bgcolor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
        color: theme === 'dark' ? 'white' : 'black',
        p: 2,
        overflowY: 'auto',
        borderRight: theme === 'dark' ? '1px solid #333' : '1px solid #ddd',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Uploaded PDF
      </Typography>
      {uploadedFile ? (
        <Typography>{uploadedFile.name}</Typography>
      ) : (
        <Typography>No PDF uploaded yet.</Typography>
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