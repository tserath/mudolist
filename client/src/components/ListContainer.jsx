import { useState, useRef, useCallback } from 'react';
import { Grid, Fab, Box } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useStore from '../store/useStore';
import ListItem from './ListItem';
import NewListDialog from './NewListDialog';
import CreateMenu from './CreateMenu';
import ListModal from './ListModal';
import NoteModal from './NoteModal';

const LONG_PRESS_DURATION = 500; // 500ms for long press

function ListContainer() {
  const [open, setOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogType, setDialogType] = useState('list');
  const longPressTimer = useRef(null);
  const { lists, reorderLists, settings, isAuthenticated } = useStore((state) => ({
    lists: state.lists,
    reorderLists: state.reorderLists,
    settings: state.settings,
    isAuthenticated: state.isAuthenticated,
  }));

  // Sort lists according to settings
  const sortedLists = [...lists].sort((a, b) => {
    // First, sort by pinned status
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    
    // Then sort by date according to settings
    if (settings.sortOrder === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const handleClickOpen = () => {
    // Use the default item type from settings
    setDialogType(settings.defaultItemType);
    setOpen(true);
  };

  const handleClose = (newItem) => {
    setOpen(false);
    
    // If a new item was created, open it
    if (newItem?.item) {
      setSelectedItem(newItem.item);
    }
  };

  const handleTouchStart = (event) => {
    const { currentTarget } = event;
    longPressTimer.current = setTimeout(() => {
      setMenuAnchor(currentTarget);
    }, LONG_PRESS_DURATION);
  };

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }, []);

  const handleMenuSelect = (type) => {
    setMenuAnchor(null);
    setDialogType(type);
    setOpen(true);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    reorderLists(result.source.index, result.destination.index);
  };

  const gridSpacing = settings.viewDensity === 'comfortable' ? 3 : 2;
  const viewComponent = settings.viewLayout === 'grid' ? Grid : Box;

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        position: 'relative', 
        p: gridSpacing,
        mt: 2 
      }}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="list-droppable">
          {(provided) => (
            <Grid container spacing={2} ref={provided.innerRef} {...provided.droppableProps}>
              {sortedLists.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={item.id}
                  index={index}
                  isDragDisabled={!isAuthenticated}
                >
                  {(provided, snapshot) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={item.id} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <ListItem
                        item={item}
                        provided={provided}
                        snapshot={snapshot}
                        type={item.type}
                      />
                    </Grid>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Grid>
          )}
        </Droppable>
      </DragDropContext>

      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={handleClickOpen}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        <AddIcon />
      </Fab>

      <CreateMenu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        onSelect={handleMenuSelect}
      />

      <NewListDialog 
        open={open} 
        onClose={handleClose} 
        type={dialogType}
      />

      {selectedItem && (
        selectedItem.type === 'note' ? (
          <NoteModal
            open={Boolean(selectedItem)}
            onClose={() => setSelectedItem(null)}
            note={selectedItem}
          />
        ) : (
          <ListModal
            open={Boolean(selectedItem)}
            onClose={() => setSelectedItem(null)}
            list={selectedItem}
          />
        )
      )}
    </Box>
  );
}

export default ListContainer;
