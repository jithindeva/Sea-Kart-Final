export const getApiBase = (): string => {
  const envUrl = (import.meta.env as any).VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') return envUrl.trim().replace(/\/$/, '');
  return 'https://sea-kart-final.onrender.com';
};
