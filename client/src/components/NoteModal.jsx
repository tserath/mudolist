import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
  TextField,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PushPin as PinIcon,
} from '@mui/icons-material';
import useStore from '../store/useStore';

function NoteModal({ open, onClose, note: initialNote }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  
  const { note, updateNote, deleteNote, togglePin } = useStore((state) => ({
    note: state.lists.find(n => n.id === initialNote.id && n.type === 'note'),
    updateNote: state.updateNote,
    deleteNote: state.deleteNote,
    togglePin: state.togglePin,
  }));

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
  }, [note?.title, note?.content]);

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(note.id);
      onClose();
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleSave = () => {
    if (title.trim() !== note.title || content !== note.content) {
      updateNote(note.id, { ...note, title: title.trim(), content });
    }
    setIsEditing(false);
  };

  const handleTitleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
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
          height: fullScreen ? '100%' : '600px',
          maxHeight: fullScreen ? '100%' : '600px',
          minHeight: fullScreen ? '100%' : '600px',
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
        <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
            {isEditing ? (
              <TextField
                autoFocus
                value={title}
                onChange={handleTitleChange}
                onKeyPress={handleTitleKeyPress}
                onBlur={handleSave}
                sx={{ 
                  '& .MuiInputBase-root': {
                    color: 'inherit'
                  },
                  '& .MuiInput-underline:before': {
                    borderBottomColor: 'inherit'
                  }
                }}
              />
            ) : (
              title
            )}
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => togglePin(note.id)}
            sx={{
              transform: note.pinned ? 'rotate(45deg)' : 'none',
              transition: 'transform 0.2s ease-in-out'
            }}
          >
            <PinIcon />
          </IconButton>
          {!isEditing && (
            <IconButton color="inherit" onClick={handleEditClick}>
              <EditIcon />
            </IconButton>
          )}
          <IconButton color="inherit" onClick={handleDeleteClick}>
            <DeleteIcon />
          </IconButton>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
            sx={{ ml: 1 }}
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <DialogContent sx={{ flex: 1, p: 2 }}>
        <TextField
          fullWidth
          multiline
          value={content}
          onChange={handleContentChange}
          onBlur={handleSave}
          variant="outlined"
          placeholder="Write your note here..."
          sx={{
            height: '100%',
            '& .MuiOutlinedInput-root': {
              height: '100%',
              alignItems: 'flex-start',
            },
            '& .MuiOutlinedInput-input': {
              height: '100% !important',
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export default NoteModal;
