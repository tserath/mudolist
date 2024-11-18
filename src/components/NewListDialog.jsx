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

  const handleCreate = async () => {
    if (title.trim()) {
      try {
        if (type === 'note') {
          const newNote = await createNote(title.trim(), '');
          handleClose();
          onClose({ type: 'note', item: newNote });
        } else {
          const newList = await createList(title.trim());
          handleClose();
          onClose({ type: 'list', item: newList });
        }
      } catch (error) {
        console.error('Failed to create item:', error);
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
