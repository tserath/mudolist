import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { List as ListIcon, Notes as NotesIcon } from '@mui/icons-material';

function CreateMenu({ anchorEl, open, onClose, onSelect }) {
  const handleSelect = (type) => {
    onSelect(type);
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
    >
      <MenuItem onClick={() => handleSelect('list')}>
        <ListItemIcon>
          <ListIcon />
        </ListItemIcon>
        <ListItemText primary="New List" />
      </MenuItem>
      <MenuItem onClick={() => handleSelect('note')}>
        <ListItemIcon>
          <NotesIcon />
        </ListItemIcon>
        <ListItemText primary="New Note" />
      </MenuItem>
    </Menu>
  );
}

export default CreateMenu;
