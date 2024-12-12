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
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  PushPin as PinIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useStore from '../store/useStore';

function ListModal({ open, onClose, list: initialList }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [newItemText, setNewItemText] = useState('');
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialList?.title || '');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemText, setEditingItemText] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);

  const { addItem, updateItem, deleteItem, reorderItems, list, updateList, deleteList, togglePin } = useStore((state) => ({
    addItem: state.addItem,
    updateItem: state.updateItem,
    deleteItem: state.deleteItem,
    reorderItems: state.reorderItems,
    list: state.lists.find(l => l.id === initialList.id && l.type === 'list'),
    updateList: state.updateList,
    deleteList: state.deleteList,
    togglePin: state.togglePin,
  }));

  useEffect(() => {
    setTitle(list?.title || '');
  }, [list?.title]);

  const handleAddItem = async (e) => {
    if (e.key === 'Enter' && newItemText.trim()) {
      try {
        await addItem(list.id, newItemText.trim());
        setNewItemText('');
      } catch (error) {
        console.error('Failed to add item:', error);
      }
    }
  };

  const handleToggleItem = async (itemId) => {
    try {
      console.log('Toggling item:', itemId);
      const item = list.items.find(i => i.id === itemId);
      console.log('Found item:', item);
      if (!item) {
        console.error('Item not found in list:', { itemId, listItems: list.items });
        return;
      }
      await updateItem(list.id, itemId, { completed: !item.completed });
    } catch (error) {
      console.error('Failed to toggle item:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteItem(list.id, itemId);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    try {
      await reorderItems(list.id, result.source.index, result.destination.index);
    } catch (error) {
      console.error('Failed to reorder items:', error);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this list?')) {
      deleteList(list.id);
      onClose();
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleTitleSave = () => {
    if (title.trim() !== list.title) {
      updateList(list.id, { ...list, title: title.trim() });
    }
    setIsEditing(false);
  };

  const handleTitleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    }
  };

  const handleEditItem = (itemId, text) => {
    setEditingItemId(itemId);
    setEditingItemText(text);
  };

  const handleSaveItem = async (itemId) => {
    if (editingItemText.trim() !== '') {
      try {
        await updateItem(list.id, itemId, { text: editingItemText.trim() });
        setEditingItemId(null);
        setEditingItemText('');
      } catch (error) {
        console.error('Failed to update item:', error);
      }
    }
  };

  const handleEditKeyPress = (e, itemId) => {
    if (e.key === 'Enter') {
      handleSaveItem(itemId);
    } else if (e.key === 'Escape') {
      setEditingItemId(null);
      setEditingItemText('');
    }
  };

  const handleMenuOpen = (event, item) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setCurrentItem(item);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setCurrentItem(null);
  };

  const handleMenuAction = (action) => {
    if (!currentItem) return;
    
    if (action === 'edit') {
      // Close menu first, then set edit mode
      handleMenuClose();
      setTimeout(() => {
        handleEditItem(currentItem.id, currentItem.text);
      }, 0);
    } else if (action === 'delete') {
      handleDeleteItem(currentItem.id);
      handleMenuClose();
    }
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
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleTitleKeyPress}
                onBlur={handleTitleSave}
                autoFocus
                sx={{ mt: -1 }}
              />
            ) : (
              title
            )}
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => togglePin(list.id)}
            sx={{
              transform: list.pinned ? 'rotate(45deg)' : 'none',
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
          <IconButton color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <DialogContent 
        sx={{ 
          flex: 1, 
          overflow: 'auto', 
          pb: 0,
          backgroundColor: theme.palette.background.paper,
        }}
      >
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
                          backgroundColor: snapshot.isDragging 
                            ? theme.palette.action.hover
                            : theme.palette.background.paper,
                        }}
                      >
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={item.completed}
                            onChange={() => handleToggleItem(item.id)}
                          />
                        </ListItemIcon>
                        {editingItemId === item.id ? (
                          <TextField
                            fullWidth
                            value={editingItemText}
                            onChange={(e) => setEditingItemText(e.target.value)}
                            onKeyDown={(e) => handleEditKeyPress(e, item.id)}
                            onBlur={() => handleSaveItem(item.id)}
                            autoFocus
                            size="small"
                            sx={{ mr: 8 }}
                          />
                        ) : (
                          <ListItemText primary={item.text} />
                        )}
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            aria-label="more"
                            onClick={(e) => handleMenuOpen(e, item)}
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            <MoreVertIcon />
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
                    {editingItemId === item.id ? (
                      <TextField
                        fullWidth
                        value={editingItemText}
                        onChange={(e) => setEditingItemText(e.target.value)}
                        onKeyDown={(e) => handleEditKeyPress(e, item.id)}
                        onBlur={() => handleSaveItem(item.id)}
                        autoFocus
                        size="small"
                        sx={{ mr: 8 }}
                      />
                    ) : (
                      <ListItemText
                        primary={item.text}
                        sx={{ textDecoration: 'line-through', color: 'text.disabled' }}
                      />
                    )}
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="more"
                        onClick={(e) => handleMenuOpen(e, item)}
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </>
        )}
      </DialogContent>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleMenuAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('delete')}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

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
