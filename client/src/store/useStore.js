import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateId } from '../utils/idGenerator';

// Get the base URL for API requests
const isDev = import.meta.env.DEV;
const API_URL = isDev ? 'http://localhost:5000' : window.location.origin;

// Helper to construct API URLs
const apiPath = (path) => `${API_URL}/api${path}`;

// Default fetch options for all API requests
const defaultFetchOptions = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

const useStore = create(
  persist(
    (set, get) => ({
      // Auth state
      token: null,
      isAuthenticated: false,
      user: null,
      lists: [],
      settings: {
        theme: 'system',
        listView: 'grid',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },

      // Auth actions
      register: async (name, email, password) => {
        const response = await fetch(apiPath('/auth/register'), {
          ...defaultFetchOptions,
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Registration failed');
        }

        const data = await response.json();
        set({
          token: data.token,
          user: data.user,
          isAuthenticated: true,
        });

        return data;
      },

      login: async (email, password) => {
        const response = await fetch(apiPath('/auth/login'), {
          ...defaultFetchOptions,
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        set({
          token: data.token,
          user: data.user,
          isAuthenticated: true,
        });

        return data;
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          lists: [],
        });
      },

      // API helpers
      fetchWithAuth: async (endpoint, options = {}) => {
        const token = get().token;
        if (!token) {
          // Automatically try to refresh the session
          try {
            const response = await fetch(apiPath('/auth/refresh'), {
              ...defaultFetchOptions,
              method: 'POST',
            });
            
            if (response.ok) {
              const data = await response.json();
              set({
                token: data.token,
                user: data.user,
                isAuthenticated: true,
              });
            } else {
              throw new Error('Authentication failed');
            }
          } catch (error) {
            console.error('Failed to refresh session:', error);
            throw new Error('Authentication failed');
          }
        }

        try {
          const response = await fetch(
            apiPath(endpoint),
            {
              ...defaultFetchOptions,
              ...options,
              headers: {
                ...defaultFetchOptions.headers,
                ...options.headers,
                Authorization: `Bearer ${get().token}`,
              },
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'API request failed');
          }

          return response;
        } catch (error) {
          console.error('API request failed:', error);
          throw error;
        }
      },

      // List actions
      fetchLists: async () => {
        try {
          const lists = await get().fetchWithAuth('/lists').then(response => response.json());
          set({ lists });
          return lists;
        } catch (error) {
          console.error('Failed to fetch lists:', error);
          throw error;
        }
      },

      createList: async (title) => {
        const newList = {
          type: 'list',
          title,
          items: [],
        };

        try {
          const savedList = await get().fetchWithAuth('/lists', {
            method: 'POST',
            body: JSON.stringify(newList),
          }).then(response => response.json());

          set((state) => ({
            lists: [...state.lists, savedList],
          }));

          return savedList;
        } catch (error) {
          console.error('Failed to create list:', error);
          throw error;
        }
      },

      createNote: async (title, content = '') => {
        const newNote = {
          type: 'note',
          title,
          content,
          items: [], // Empty items array for notes
        };

        try {
          const savedNote = await get().fetchWithAuth('/lists', {
            method: 'POST',
            body: JSON.stringify(newNote),
          }).then(response => response.json());

          set((state) => ({
            lists: [...state.lists, savedNote],
          }));

          return savedNote;
        } catch (error) {
          console.error('Failed to create note:', error);
          throw error;
        }
      },

      updateList: async (id, updatedList) => {
        try {
          const list = get().lists.find(l => l.id === id);
          if (!list || list.type !== 'list') {
            throw new Error('List not found or wrong type');
          }

          // Ensure we don't send note-specific fields
          const { content, ...listUpdate } = updatedList;
          const savedList = await get().fetchWithAuth(`/lists/${id}`, {
            method: 'PUT',
            body: JSON.stringify(listUpdate),
          }).then(response => response.json());

          set((state) => ({
            lists: state.lists.map((list) =>
              list.id === id ? savedList : list
            ),
          }));

          return savedList;
        } catch (error) {
          console.error('Failed to update list:', error);
          throw error;
        }
      },

      updateNote: async (id, updatedNote) => {
        try {
          const note = get().lists.find(n => n.id === id);
          if (!note || note.type !== 'note') {
            throw new Error('Note not found or wrong type');
          }

          // Ensure we don't send list-specific fields
          const { items, ...noteUpdate } = updatedNote;
          const savedNote = await get().fetchWithAuth(`/lists/${id}`, {
            method: 'PUT',
            body: JSON.stringify(noteUpdate),
          }).then(response => response.json());

          set((state) => ({
            lists: state.lists.map((list) =>
              list.id === id ? savedNote : list
            ),
          }));

          return savedNote;
        } catch (error) {
          console.error('Failed to update note:', error);
          throw error;
        }
      },

      deleteList: async (id) => {
        try {
          const list = get().lists.find(l => l.id === id);
          if (!list || list.type !== 'list') {
            throw new Error('List not found or wrong type');
          }

          await get().fetchWithAuth(`/lists/${id}`, {
            method: 'DELETE',
          });

          set((state) => ({
            lists: state.lists.filter((l) => l.id !== id),
          }));
        } catch (error) {
          console.error('Failed to delete list:', error);
          throw error;
        }
      },

      deleteNote: async (id) => {
        try {
          const note = get().lists.find(n => n.id === id);
          if (!note || note.type !== 'note') {
            throw new Error('Note not found or wrong type');
          }

          await get().fetchWithAuth(`/lists/${id}`, {
            method: 'DELETE',
          });

          set((state) => ({
            lists: state.lists.filter((n) => n.id !== id),
          }));
        } catch (error) {
          console.error('Failed to delete note:', error);
          throw error;
        }
      },

      reorderLists: async (sourceIndex, destinationIndex) => {
        set((state) => {
          const newLists = Array.from(state.lists);
          const [removed] = newLists.splice(sourceIndex, 1);
          newLists.splice(destinationIndex, 0, removed);
          return { lists: newLists };
        });
      },

      addItem: async (listId, text) => {
        const newItem = {
          text,
          completed: false,
        };

        try {
          const savedItem = await get().fetchWithAuth(`/lists/${listId}/items`, {
            method: 'POST',
            body: JSON.stringify(newItem),
          }).then(response => response.json());

          set((state) => ({
            lists: state.lists.map((list) =>
              list.id === listId
                ? { ...list, items: [...(list.items || []), savedItem] }
                : list
            ),
          }));

          return savedItem;
        } catch (error) {
          console.error('Failed to add item:', error);
          throw error;
        }
      },

      updateItem: async (listId, itemId, updates) => {
        console.log('Updating item:', { listId, itemId, updates });
        try {
          const response = await get().fetchWithAuth(`/lists/${listId}/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update item');
          }

          const updatedItem = await response.json();
          console.log('Server response:', updatedItem);

          set((state) => ({
            lists: state.lists.map((list) =>
              list.id === listId
                ? {
                    ...list,
                    items: list.items.map((item) =>
                      item.id === itemId
                        ? { ...item, ...updates }
                        : item
                    ),
                  }
                : list
            ),
          }));
        } catch (error) {
          console.error('Error updating item:', error);
          throw error;
        }
      },

      deleteItem: async (listId, itemId) => {
        try {
          await get().fetchWithAuth(`/lists/${listId}/items/${itemId}`, {
            method: 'DELETE',
          });

          set((state) => ({
            lists: state.lists.map((list) =>
              list.id === listId
                ? {
                    ...list,
                    items: list.items.filter((item) => item.id !== itemId),
                  }
                : list
            ),
          }));
        } catch (error) {
          console.error('Failed to delete item:', error);
          throw error;
        }
      },

      reorderItems: async (listId, sourceIndex, destinationIndex) => {
        try {
          console.log('Reordering items:', { listId, sourceIndex, destinationIndex });

          // Optimistically update the UI
          const currentList = get().lists.find(l => l.id === listId);
          if (!currentList) {
            throw new Error('List not found');
          }

          const newItems = [...currentList.items];
          const [movedItem] = newItems.splice(sourceIndex, 1);
          newItems.splice(destinationIndex, 0, movedItem);

          set(state => ({
            lists: state.lists.map(list =>
              list.id === listId
                ? { ...list, items: newItems }
                : list
            )
          }));

          // Send update to server
          const response = await get().fetchWithAuth(`/lists/${listId}/reorder`, {
            method: 'PUT',
            body: JSON.stringify({ sourceIndex, destinationIndex }),
          });

          const updatedList = await response.json();
          console.log('Server response:', updatedList);

          // Update with server response
          set(state => ({
            lists: state.lists.map(list =>
              list.id === listId ? updatedList : list
            )
          }));
        } catch (error) {
          console.error('Error reordering items:', error);
          // Revert optimistic update on error
          const originalList = get().lists.find(l => l.id === listId);
          if (originalList) {
            set(state => ({
              lists: state.lists.map(list =>
                list.id === listId ? originalList : list
              )
            }));
          }
          throw error;
        }
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        }));
      },

      togglePin: async (id) => {
        const state = get();
        const item = state.lists.find(item => item.id === id);
        if (!item) return;

        try {
          const updatedItem = await state.fetchWithAuth(`/lists/${id}/pin`, {
            method: 'PATCH',
          }).then(response => response.json());

          set((state) => ({
            lists: state.lists.map(item => 
              item.id === id ? { ...updatedItem } : item
            ),
          }));
        } catch (error) {
          console.error('Error toggling pin status:', error);
          throw error;
        }
      },
    }),
    {
      name: 'mudo-list-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        settings: state.settings
      })
    }
  )
);

export default useStore;
