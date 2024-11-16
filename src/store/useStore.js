import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../utils/idGenerator';

const API_URL = 'http://localhost:5000/api';

const useStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      token: null,
      isAuthenticated: false,
      lists: [],
      darkMode: false,
      settings: {
        theme: 'light',
        defaultItemType: 'list',
        viewLayout: 'grid',
        sortOrder: 'newest',
        viewDensity: 'comfortable',
        showCompleted: true,
        autoSaveInterval: 30,
      },

      // Auth actions
      register: async (name, email, password) => {
        try {
          const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
          }

          const data = await response.json();
          set({
            user: {
              _id: data._id,
              name: data.name,
              email: data.email,
            },
            token: data.token,
            isAuthenticated: true,
            settings: data.settings,
          });
        } catch (error) {
          console.error('Registration error:', error);
          throw error;
        }
      },

      login: async (email, password) => {
        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
          }

          const data = await response.json();
          set({
            user: {
              _id: data._id,
              name: data.name,
              email: data.email,
            },
            token: data.token,
            isAuthenticated: true,
            settings: data.settings,
          });
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          lists: [],
        });
      },

      // API helpers
      fetchWithAuth: async (endpoint, options = {}) => {
        const { token } = get();
        if (!token) throw new Error('No token available');

        const response = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'API request failed');
        }

        return response.json();
      },

      // List actions
      fetchLists: async () => {
        try {
          const lists = await get().fetchWithAuth('/lists');
          set({ lists });
        } catch (error) {
          console.error('Failed to fetch lists:', error);
          throw error;
        }
      },

      createList: (title) => {
        const newList = {
          id: generateId(),
          type: 'list',
          title,
          items: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          lists: [...state.lists, newList],
        }));
        
        // Sync with backend
        get().fetchWithAuth('/lists', {
          method: 'POST',
          body: JSON.stringify(newList),
        }).catch(console.error);
        
        return newList;
      },

      createNote: (title, content = '') => {
        const newNote = {
          id: generateId(),
          type: 'note',
          title,
          content,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          lists: [...state.lists, newNote],
        }));
        
        // Sync with backend
        get().fetchWithAuth('/lists', {
          method: 'POST',
          body: JSON.stringify(newNote),
        }).catch(console.error);
        
        return newNote;
      },

      updateList: (id, updatedList) => {
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === id ? { ...list, ...updatedList } : list
          ),
        }));
        
        // Sync with backend
        get().fetchWithAuth(`/lists/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updatedList),
        }).catch(console.error);
      },

      deleteList: (id) => {
        set((state) => ({
          lists: state.lists.filter((list) => list.id !== id),
        }));
        
        // Sync with backend
        get().fetchWithAuth(`/lists/${id}`, {
          method: 'DELETE',
        }).catch(console.error);
      },

      toggleDarkMode: () =>
        set((state) => ({
          darkMode: !state.darkMode,
        })),

      reorderLists: (sourceIndex, destinationIndex) =>
        set((state) => {
          const newLists = Array.from(state.lists);
          const [removed] = newLists.splice(sourceIndex, 1);
          newLists.splice(destinationIndex, 0, removed);
          return { lists: newLists };
        }),

      addItem: (listId, text) => {
        const newItem = {
          id: generateId(),
          text,
          completed: false,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => {
          const updatedLists = state.lists.map((list) =>
            list.id === listId && list.type === 'list'
              ? {
                  ...list,
                  items: [...(list.items || []), newItem],
                }
              : list
          );
          return { lists: updatedLists };
        });
        
        return newItem;
      },

      updateItem: (listId, itemId, updates) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId && list.type === 'list'
              ? {
                  ...list,
                  items: list.items.map((item) =>
                    item.id === itemId ? { ...item, ...updates } : item
                  ),
                }
              : list
          ),
        })),

      deleteItem: (listId, itemId) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId && list.type === 'list'
              ? {
                  ...list,
                  items: list.items.filter((item) => item.id !== itemId),
                }
              : list
          ),
        })),

      reorderItems: (listId, sourceIndex, destinationIndex) =>
        set((state) => ({
          lists: state.lists.map((list) => {
            if (list.id === listId && list.type === 'list') {
              const newItems = Array.from(list.items);
              const [removed] = newItems.splice(sourceIndex, 1);
              newItems.splice(destinationIndex, 0, removed);
              return { ...list, items: newItems };
            }
            return list;
          }),
        })),

      updateSettings: async (newSettings) => {
        try {
          if (get().isAuthenticated) {
            const { settings } = await get().fetchWithAuth('/auth/settings', {
              method: 'PUT',
              body: JSON.stringify(newSettings),
            });
            set((state) => ({
              settings: {
                ...state.settings,
                ...settings,
              },
            }));
          } else {
            set((state) => ({
              settings: {
                ...state.settings,
                ...newSettings,
              },
            }));
          }
        } catch (error) {
          console.error('Failed to update settings:', error);
          throw error;
        }
      },
    }),
    {
      name: 'mudo-list-storage',
      version: 1,
      partialize: (state) => ({
        darkMode: state.darkMode,
        token: state.token,
        user: state.user,
        settings: state.settings,
        lists: state.lists,
      }),
    }
  )
);

export default useStore;
