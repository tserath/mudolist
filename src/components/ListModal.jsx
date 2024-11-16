import { useState } from 'react';
import {
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Checkbox,
  TextField,
  Divider,
  Box,
  Collapse,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useStore from '../store/useStore';

function ListModal({ open, onClose, list }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [newItemText, setNewItemText] = useState('');
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const { addItem, updateItem, deleteItem, reorderItems } = useStore((state) => ({
    addItem: state.addItem,
    updateItem: state.updateItem,
    deleteItem: state.deleteItem,
    reorderItems: state.reorderItems,
  }));

  const handleAddItem = (e) => {
    if (e.key === 'Enter' && newItemText.trim()) {
      const newItem = addItem(list.id, newItemText.trim());
      setNewItemText('');
      // Force a re-render by updating the list reference
      if (list.items) {
        list.items = [...list.items, newItem];
      } else {
        list.items = [newItem];
      }
    }
  };

  const handleToggleItem = (itemId) => {
    const item = list.items.find(i => i.id === itemId);
    const newCompleted = !item.completed;
    updateItem(list.id, itemId, { completed: newCompleted });
    
    // Force a re-render by updating the list reference
    list.items = list.items.map(i => 
      i.id === itemId 
        ? { ...i, completed: newCompleted }
        : i
    );
  };

  const handleDeleteItem = (itemId) => {
    deleteItem(list.id, itemId);
    
    // Force a re-render by updating the list reference
    list.items = list.items.filter(i => i.id !== itemId);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    reorderItems(list.id, result.source.index, result.destination.index);
  };

  const uncompleted = list?.items?.filter(item => !item.completed) || [];
  const completed = list?.items?.filter(item => item.completed) || [];

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
            {list?.title}
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
      
      <DialogContent sx={{ flex: 1, overflow: 'auto', pb: 0 }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={`list-${list?.id}-items`}>
            {(provided) => (
              <List {...provided.droppableProps} ref={provided.innerRef}>
                {uncompleted.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{
                          ...provided.draggableProps.style,
                          transform: snapshot.isDragging
                            ? `${provided.draggableProps.style?.transform || ''} scale(1.02)`
                            : provided.draggableProps.style?.transform,
                          transition: 'transform 0.2s ease',
                          backgroundColor: snapshot.isDragging ? 'action.hover' : 'background.paper',
                        }}
                      >
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={item.completed}
                            onChange={() => handleToggleItem(item.id)}
                          />
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>

        {completed.length > 0 && (
          <>
            <Divider />
            <ListItem 
              button 
              onClick={() => setCompletedExpanded(!completedExpanded)}
              sx={{ py: 1 }}
            >
              <ListItemText
                primary={`Completed (${completed.length})`}
                sx={{ color: 'text.secondary' }}
              />
              {completedExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItem>
            <Collapse in={completedExpanded}>
              <List>
                {completed.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={item.completed}
                        onChange={() => handleToggleItem(item.id)}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{ textDecoration: 'line-through', color: 'text.disabled' }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </>
        )}
      </DialogContent>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 1,
          borderBottomLeftRadius: fullScreen ? 0 : 2,
          borderBottomRightRadius: fullScreen ? 0 : 2,
        }}
      >
        <ListItem>
          <ListItemIcon>
            <AddIcon color="disabled" />
          </ListItemIcon>
          <TextField
            fullWidth
            placeholder="Add new item"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyPress={handleAddItem}
            size="small"
          />
        </ListItem>
      </Paper>
    </Dialog>
  );
}

export default ListModal;
