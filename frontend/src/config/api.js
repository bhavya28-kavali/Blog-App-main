const envUrl = import.meta.env.VITE_API_URL
// devFallback should match backend port used during local development
const devFallback = import.meta.env.MODE === 'development' ? 'http://localhost:3000' : ''
export const API_BASE = envUrl ?? devFallback

