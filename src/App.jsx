import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import useStore from './store/useStore';
import ListContainer from './components/ListContainer';
import { useMemo, useState, useEffect } from 'react';
import AppBar from './components/AppBar';
import Settings from './components/Settings';
import Login from './components/Login';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, isAuthenticated, fetchLists } = useStore((state) => ({
    settings: state.settings,
    isAuthenticated: state.isAuthenticated,
    fetchLists: state.fetchLists,
  }));

  useEffect(() => {
    if (isAuthenticated) {
      fetchLists();
    }
  }, [isAuthenticated, fetchLists]);

  const theme = useMemo(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeMode = settings.theme === 'system' 
      ? (prefersDarkMode ? 'dark' : 'light')
      : settings.theme;

    return createTheme({
      palette: {
        mode: themeMode,
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
