import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  TextField,
  Box,
  ClickAwayListener,
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Description as NoteIcon,
  CheckBox as ListIcon 
} from '@mui/icons-material';
import useStore from '../store/useStore';
import ListModal from './ListModal';
import NoteModal from './NoteModal';

function ListItem({ list }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const updateList = useStore((state) => state.updateList);

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleClickAway = () => {
    if (isEditing && title.trim() !== list.title) {
      updateList(list.id, { ...list, title: title.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleClickAway();
    }
  };

  const handleCardClick = () => {
    if (!isEditing) {
      setIsModalOpen(true);
    }
  };

  const Modal = list.type === 'note' ? NoteModal : ListModal;

  return (
    <>
      <Card 
        sx={{ 
          height: '100%',
          cursor: isEditing ? 'default' : 'pointer',
          borderRadius: 4,
          '&:hover': {
            boxShadow: (theme) => theme.shadows[4],
            transform: isEditing ? 'none' : 'translateY(-2px)',
          },
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onClick={handleCardClick}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isEditing ? (
              <ClickAwayListener onClickAway={handleClickAway}>
                <TextField
                  fullWidth
                  value={title}
                  onChange={handleTitleChange}
                  onKeyPress={handleKeyPress}
                  autoFocus
                  size="small"
                  onClick={(e) => e.stopPropagation()}
                />
              </ClickAwayListener>
            ) : (
              <>
                {list.type === 'note' ? (
                  <NoteIcon 
                    color="action" 
                    sx={{ 
                      fontSize: 28,
                      color: (theme) => theme.palette.mode === 'light' ? 'primary.main' : 'primary.light'
                    }} 
                  />
                ) : (
                  <ListIcon 
                    color="action" 
                    sx={{ 
                      fontSize: 28,
                      color: (theme) => theme.palette.mode === 'light' ? 'secondary.main' : 'secondary.light'
                    }} 
                  />
                )}
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {title}
                </Typography>
                <IconButton
                  size="small"
                  onClick={handleEditClick}
                  sx={{ ml: 1 }}
                >
                  <EditIcon />
                </IconButton>
              </>
            )}
          </Box>
          {list.type === 'note' && (
            <Typography
              color="text.secondary"
              sx={{
                mt: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {list.content}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        list={list}
        note={list}
      />
    </>
  );
}

export default ListItem;
