import { AppBar, Toolbar, Typography, IconButton, useTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import useStore from '../store/useStore';

function Header() {
  const theme = useTheme();
  const toggleDarkMode = useStore((state) => state.toggleDarkMode);

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          MudoList
        </Typography>
        <IconButton onClick={toggleDarkMode} color="inherit">
          {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
