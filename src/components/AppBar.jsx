import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
} from '@mui/material';
import { Settings as SettingsIcon, Logout as LogoutIcon } from '@mui/icons-material';
import useStore from '../store/useStore';

function AppBar({ onSettingsClick }) {
  const { logout, user } = useStore((state) => ({
    logout: state.logout,
    user: state.user,
  }));

  return (
    <MuiAppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          MudoList
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.name}
          </Typography>
          <IconButton
            color="inherit"
            onClick={onSettingsClick}
            aria-label="settings"
          >
            <SettingsIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={logout}
            aria-label="logout"
          >
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
}

export default AppBar;
