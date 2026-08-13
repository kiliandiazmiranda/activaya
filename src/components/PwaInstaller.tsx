"use client";
// Registro del service worker para habilitar las funciones PWA.

import { useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

const PwaInstaller = () => {
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registerServiceWorker = () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      };

      if (document.readyState === 'complete') {
        registerServiceWorker();
      } else {
        window.addEventListener('load', registerServiceWorker);
        return () => window.removeEventListener('load', registerServiceWorker);
      }
    }
  }, []);

  return null;
};

export default PwaInstaller;
