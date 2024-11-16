import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import useStore from '../store/useStore';

function Settings({ open, onClose }) {
  const { settings, updateSettings } = useStore((state) => ({
    settings: state.settings,
    updateSettings: state.updateSettings,
  }));

  const handleChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
        },
      }}
    >
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <List
          subheader={
            <Typography
              variant="h6"
              align="center"
              sx={{
                py: 2,
                color: 'text.primary',
              }}
            >
              Appearance
            </Typography>
          }
        >
          <ListItem>
            <ListItemText 
              primary="Theme"
              secondary="Choose your preferred theme"
            />
            <Select
              value={settings.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
              size="small"
            >
              <MenuItem value="system">System</MenuItem>
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
            </Select>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="View Layout"
              secondary="Choose how items are displayed"
            />
            <Select
              value={settings.viewLayout}
              onChange={(e) => handleChange('viewLayout', e.target.value)}
              size="small"
            >
              <MenuItem value="grid">Grid</MenuItem>
              <MenuItem value="list">List</MenuItem>
            </Select>
          </ListItem>

          <ListItem>
            <ListItemText 
              primary="View Density"
              secondary="Adjust the spacing between items"
            />
            <Select
              value={settings.viewDensity}
              onChange={(e) => handleChange('viewDensity', e.target.value)}
              size="small"
            >
              <MenuItem value="comfortable">Comfortable</MenuItem>
              <MenuItem value="compact">Compact</MenuItem>
            </Select>
          </ListItem>
        </List>

        <Divider />

        <List
          subheader={
            <Typography
              variant="h6"
              align="center"
              sx={{
                py: 2,
                color: 'text.primary',
              }}
            >
              Behavior
            </Typography>
          }
        >
          <ListItem>
            <ListItemText 
              primary="Default Item Type"
              secondary="Choose what to create when pressing the + button"
            />
            <Select
              value={settings.defaultItemType}
              onChange={(e) => handleChange('defaultItemType', e.target.value)}
              size="small"
            >
              <MenuItem value="list">List</MenuItem>
              <MenuItem value="note">Note</MenuItem>
            </Select>
          </ListItem>

          <ListItem>
            <ListItemText 
              primary="Sort Order"
              secondary="Choose how items are sorted by default"
            />
            <Select
              value={settings.sortOrder}
              onChange={(e) => handleChange('sortOrder', e.target.value)}
              size="small"
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
            </Select>
          </ListItem>

          <ListItem>
            <ListItemText 
              primary="Show Completed Items"
              secondary="Show completed items by default in lists"
            />
            <Switch
              edge="end"
              checked={settings.showCompleted}
              onChange={(e) => handleChange('showCompleted', e.target.checked)}
            />
          </ListItem>

          <ListItem>
            <ListItemText 
              primary="Auto-save Interval"
              secondary="How often to save changes (in seconds)"
            />
            <Select
              value={settings.autoSaveInterval}
              onChange={(e) => handleChange('autoSaveInterval', e.target.value)}
              size="small"
            >
              <MenuItem value={15}>15 seconds</MenuItem>
              <MenuItem value={30}>30 seconds</MenuItem>
              <MenuItem value={60}>1 minute</MenuItem>
            </Select>
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default Settings;
