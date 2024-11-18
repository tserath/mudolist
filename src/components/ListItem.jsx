import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import ListModal from './ListModal';
import NoteModal from './NoteModal';

function ListItem({ item, provided, snapshot, type }) {
  const [modalOpen, setModalOpen] = useState(false);
  const theme = useTheme();

  const handleClick = () => {
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Card
        onClick={handleClick}
        sx={{
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.paper,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          transform: snapshot?.isDragging ? 'scale(1.02)' : 'scale(1)',
          boxShadow: snapshot?.isDragging ? theme.shadows[8] : theme.shadows[1],
          '&:hover': {
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <CardContent>
          <Typography variant="h6" noWrap>
            {item.title}
          </Typography>
          {type === 'note' && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {item.content}
            </Typography>
          )}
          {type === 'list' && (
            <Typography variant="body2" color="text.secondary">
              {item.items?.length || 0} items
            </Typography>
          )}
        </CardContent>
      </Card>

      {type === 'note' ? (
        <NoteModal
          open={modalOpen}
          onClose={handleClose}
          note={item}
        />
      ) : (
        <ListModal
          open={modalOpen}
          onClose={handleClose}
          list={item}
        />
      )}
    </>
  );
}

export default ListItem;
