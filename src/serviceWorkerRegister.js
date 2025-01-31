export function registerServiceWorker() {

    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker
        .register('/sw.js') 
        .then((registration) => {
          console.log('Service Worker registriran:', registration);
  
          navigator.serviceWorker.ready.then((swRegistration) => {
            return swRegistration.sync.register('sync-data').then(() => {
              console.log('Background Sync registriran s oznakom: sync-data');
            });
          });
        })
        .catch((error) => {
          console.error('Greška pri registraciji SW:', error);
        });
    } else {
      console.warn('Service Worker ili Background Sync nisu podržani u ovom pregledniku.');
    }
  }
  
