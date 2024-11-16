import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Alert,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import useStore from '../store/useStore';

const Share = ({ open, onClose, list }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('read');
  const [error, setError] = useState('');
  const { shareList, removeShare } = useStore();

  const handleShare = async () => {
    try {
      await shareList(list.id, email, permission);
      setEmail('');
      setError('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRemoveShare = async (userId) => {
    try {
      await removeShare(list.id, userId);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share {list.title}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="subtitle1" gutterBottom>
          Share with others
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <TextField
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
          />
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Permission</InputLabel>
          <Select
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
            label="Permission"
          >
            <MenuItem value="read">Read only</MenuItem>
            <MenuItem value="write">Can edit</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleShare}
          disabled={!email}
          fullWidth
        >
          Share
        </Button>

        {list.shared?.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Shared with
            </Typography>
            <List>
              {list.shared.map((share) => (
                <ListItem key={share.user._id}>
                  <ListItemText
                    primary={share.user.email}
                    secondary={
                      share.permission === 'write' ? 'Can edit' : 'Read only'
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemoveShare(share.user._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default Share;
