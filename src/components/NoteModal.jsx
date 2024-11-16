import { useState, useEffect } from 'react';
import {
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
  TextField,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import useStore from '../store/useStore';

function NoteModal({ open, onClose, note }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const updateList = useStore((state) => state.updateList);
  const [content, setContent] = useState(note?.content || '');

  // Update content when note changes
  useEffect(() => {
    setContent(note?.content || '');
  }, [note]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    updateList(note.id, { ...note, content: newContent });
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 2,
          height: fullScreen ? '100%' : 'auto',
          maxHeight: fullScreen ? '100%' : '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <AppBar 
        position="relative" 
        elevation={0}
        sx={{ 
          borderTopLeftRadius: fullScreen ? 0 : 2,
          borderTopRightRadius: fullScreen ? 0 : 2,
        }}
      >
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            {note?.title}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <DialogContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        <TextField
          multiline
          fullWidth
          variant="outlined"
          placeholder="Write your note here..."
          value={content}
          onChange={handleContentChange}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              height: '100%',
              '& textarea': {
                height: '100% !important',
              },
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export default NoteModal;
