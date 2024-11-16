import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import useStore from '../store/useStore';

function NewListDialog({ open, onClose, type = 'list' }) {
  const [title, setTitle] = useState('');
  const { createList, createNote } = useStore((state) => ({
    createList: state.createList,
    createNote: state.createNote,
  }));

  const handleClose = () => {
    setTitle('');
    onClose();
  };

  const handleCreate = () => {
    if (title.trim()) {
      if (type === 'note') {
        const newNote = createNote(title.trim(), '');
        handleClose();
        // Signal to parent that we want to open the note modal
        onClose(newNote);
      } else {
        const newList = createList(title.trim());
        handleClose();
        // Signal to parent that we want to open the list modal
        onClose(newList);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {type === 'note' ? 'Create New Note' : 'Create New List'}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleCreate} variant="contained" color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NewListDialog;
