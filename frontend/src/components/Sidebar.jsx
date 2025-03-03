import { Box, List, ListItem, ListItemButton, ListItemText, Typography, IconButton, Divider, Chip } from '@mui/material';
import PropTypes from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

const Sidebar = ({ files, onSelectFile, selectedFileId, theme, isMobile, onClose, handleNewChat }) => {
  const categorizeFiles = (files) => {
    const now = new Date();
    const categories = {
      today: [],
      last7: [],
      last30: [],
      older: []
    };

    files.forEach(file => {
      const uploadDate = file.uploadedAt || now;
      const diffDays = Math.floor((now - uploadDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) categories.today.push(file);
      else if (diffDays <= 7) categories.last7.push(file);
      else if (diffDays <= 30) categories.last30.push(file);
      else categories.older.push(file);
    });

    return categories;
  };

  const categories = categorizeFiles(files);

  return (
    <>
      {isMobile && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0,0,0,0.5)',
          zIndex: 1299,
        }} onClick={onClose} />
      )}

      <Box sx={{
        width: isMobile ? '80vw' : '280px',
        minWidth: '200px',
        borderRight: `1px solid ${theme === 'dark' ? '#444' : '#ccc'}`,
        height: '100%',
        overflowY: 'auto',
        bgcolor: theme === 'dark' ? '#121212' : '#fff',
        position: isMobile ? 'fixed' : 'relative',
        zIndex: 1300,
        left: 0,
        top: 0,
        transform: isMobile ? 'translateX(0)' : 'none',
        transition: 'transform 0.3s ease-in-out',
        boxShadow: isMobile ? 3 : 'none',
      }}>
        {isMobile && (
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'flex-end',
            p: 1,
            borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#eee'}`
          }}>
            <IconButton onClick={onClose}>
              <CloseIcon sx={{ color: theme === 'dark' ? 'white' : 'black' }} />
            </IconButton>
          </Box>
        )}

        <List sx={{ p: 1 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleNewChat}
              sx={{
                borderRadius: 2,
                bgcolor: theme === 'dark' ? '#1E1E1E' : '#f5f5f5',
                '&:hover': { bgcolor: theme === 'dark' ? '#2d2d2d' : '#e0e0e0' }
              }}
            >
              <AddIcon sx={{ mr: 1, color: theme === 'dark' ? '#fff' : '#000' }} />
              <ListItemText 
                primary="New Chat" 
                primaryTypographyProps={{ 
                  variant: 'body1',
                  fontWeight: 500,
                  color: theme === 'dark' ? '#fff' : '#000'
                }} 
              />
            </ListItemButton>
          </ListItem>
        </List>

        <Divider sx={{ borderColor: theme === 'dark' ? '#333' : '#eee' }} />

        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: theme === 'dark' ? '#fff' : '#000' }}>
            Your PDFs
          </Typography>

          {Object.entries(categories).map(([category, items]) => (
            items.length > 0 && (
              <Box key={category} sx={{ mb: 3 }}>
                <Chip 
                  label={
                    category === 'today' ? 'Today' :
                    category === 'last7' ? 'Last 7 Days' :
                    category === 'last30' ? 'Last 30 Days' : 'Older'
                  }
                  size="small"
                  sx={{ 
                    mb: 1,
                    bgcolor: theme === 'dark' ? '#333' : '#eee',
                    color: theme === 'dark' ? '#fff' : '#000'
                  }}
                />
                <List dense sx={{ mb: 2 }}>
                  {items.map(file => (
                    <ListItem key={file.id} disablePadding>
                      <ListItemButton
                        selected={selectedFileId === file.id}
                        onClick={() => onSelectFile(file)}
                        sx={{
                          borderRadius: 1,
                          mb: 0.5,
                          '&.Mui-selected': {
                            bgcolor: theme === 'dark' ? '#1E1E1E' : '#f5f5f5',
                          },
                          '&:hover': {
                            bgcolor: theme === 'dark' ? '#1E1E1E' : '#f5f5f5'
                          }
                        }}
                      >
                        <ListItemText 
                          primary={file.fileName} 
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            sx: {
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              color: theme === 'dark' ? '#fff' : '#000'
                            }
                          }} 
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )
          ))}

          {files.length === 0 && (
            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#aaa' : '#666', textAlign: 'center' }}>
              No uploaded documents
            </Typography>
          )}
        </Box>
      </Box>
    </>
  );
};

Sidebar.propTypes = {
  files: PropTypes.array.isRequired,
  onSelectFile: PropTypes.func.isRequired,
  selectedFileId: PropTypes.string,
  theme: PropTypes.oneOf(['dark', 'light']).isRequired,
  isMobile: PropTypes.bool,
  onClose: PropTypes.func,
  handleNewChat: PropTypes.func.isRequired,
};

export default Sidebar;