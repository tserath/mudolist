import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import useStore from './store/useStore';
import ListContainer from './components/ListContainer';
import { useMemo, useState, useEffect } from 'react';
import AppBar from './components/AppBar';
import Settings from './components/Settings';
import Login from './components/Login';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, isAuthenticated, fetchLists, token } = useStore((state) => ({
    settings: state.settings,
    isAuthenticated: state.isAuthenticated,
    fetchLists: state.fetchLists,
    token: state.token,
  }));

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchLists().catch(error => {
        console.error('Failed to fetch lists:', error);
        // If token is invalid, it will be cleared by fetchWithAuth
      });
    }
  }, [isAuthenticated, token, fetchLists]);

  const theme = useMemo(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeMode = settings.theme === 'system' 
      ? (prefersDarkMode ? 'dark' : 'light')
      : settings.theme;

    return createTheme({
      palette: {
        mode: themeMode,
        background: {
          default: themeMode === 'dark' ? '#121212' : '#f5f5f5',
          paper: themeMode === 'dark' ? '#1e1e1e' : '#ffffff',
        },
        ...(themeMode === 'dark' && {
          action: {
            hover: 'rgba(255, 255, 255, 0.08)',
          },
        }),
      },
      components: {
        MuiDialog: {
          styleOverrides: {
            paper: {
              backgroundColor: themeMode === 'dark' ? '#1e1e1e' : '#ffffff',
            },
          },
        },
        MuiListItem: {
          styleOverrides: {
            root: {
              '&:hover': {
                backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              },
            },
          },
        },
      },
    });
  }, [settings.theme]);

  useEffect(() => {
    if (settings.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const prefersDarkMode = mediaQuery.matches;
      const theme = createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      });
      document.documentElement.style.setProperty('color-scheme', prefersDarkMode ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isAuthenticated ? (
        <>
          <AppBar onSettingsClick={() => setSettingsOpen(true)} />
          <ListContainer />
          <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </>
      ) : (
        <Login />
      )}
    </ThemeProvider>
  );
}

export default App;
