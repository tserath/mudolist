export const generateId = () => {
  // Generate a string ID using timestamp and random number
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
