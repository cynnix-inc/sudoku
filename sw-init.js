// Service worker registration moved out of index.html to tighten CSP
(function registerSW(){
  try {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').then((reg) => {
        try { if (reg.waiting) { reg.waiting.postMessage({ type: 'SKIP_WAITING' }); } } catch {}
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              try { sw.postMessage({ type: 'SKIP_WAITING' }); } catch {}
            }
          });
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => { try { window.location.reload(); } catch {} });
    });
  } catch {}
})(); 