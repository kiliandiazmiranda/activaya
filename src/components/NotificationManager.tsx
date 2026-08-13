"use client";
// Gestiona permisos de notificaciones y mantiene sincronizados los recordatorios.

import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Pausa } from '@/lib/types';
import { syncAllNotifications } from '@/lib/notifications';

  // Solicita permiso al navegador antes de activar los recordatorios de escritorio.
const requestNotificationPermission = async (toast: (options: any) => void): Promise<boolean> => {
  if (!('Notification' in window)) {
    toast({
        variant: "destructive",
        title: "Navegador no compatible",
        description: "Este navegador no soporta notificaciones de escritorio.",
    });
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
       console.log('Permiso de notificaciones concedido.');
       return true;
    } else {
      console.log('Permiso de notificaciones denegado.');
      toast({
        title: "Permiso denegado",
        description: "No podremos notificarte sobre tus pausas.",
      });
      return false;
    }
  } catch(error) {
    console.error("Error pidiendo permiso de notificación", error);
    return false;
  }
};


const NotificationManager = () => {
  const { toast } = useToast();
  const [breaks] = useLocalStorage<Pausa[]>('breaks', []);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    // Listener for messages from the service worker
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_NOTIFICATIONS') {
        console.log('[Client] Received SYNC_NOTIFICATIONS request from SW.');
        syncAllNotifications(breaks);
      }
    };
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSWMessage);
    }
    
    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage);
      }
    }
  // We only want to set this up once, but we need `breaks` to be up to date.
  // The breaks dependency here ensures syncs are called with the latest data.
  }, [breaks]);

  useEffect(() => {
    if (hasMounted && 'Notification' in window && 'serviceWorker' in navigator) {
      if (Notification.permission === 'default') {
        const timer = setTimeout(() => {
            requestNotificationPermission(toast).then(granted => {
              if (granted) {
                navigator.serviceWorker.ready.then(() => {
                    syncAllNotifications(breaks);
                });
              }
            });
        }, 3000); 
        return () => clearTimeout(timer);
      } else if (Notification.permission === 'granted') {
          navigator.serviceWorker.ready.then(() => {
              syncAllNotifications(breaks);
          });
      }
    }
  }, [hasMounted, toast, breaks]);
  
  return null;
};

export default NotificationManager;
