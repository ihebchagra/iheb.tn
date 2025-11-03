// Minimal Service Worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js?v=1')
      .then((reg) => {
        // Optionally check for updates periodically
        setInterval(() => reg.update(), 60000);
      })
      .catch((err) => console.error('SW registration failed:', err));
  });
}
