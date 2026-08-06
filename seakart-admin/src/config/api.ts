export const getApiBase = (): string => {
  const envUrl = (import.meta.env as any).VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') return envUrl.trim().replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://sea-kart-final.onrender.com';
  }
  return 'http://localhost:5000';
};
