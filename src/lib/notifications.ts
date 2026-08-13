"use client";
// Lógica de programación, cancelación y sincronización de notificaciones.
import type { Pausa } from './types';

const timeoutStore: { [key: string]: NodeJS.Timeout } = {};

const dayNameToNumber: { [key: string]: number } = {
  'Domingo': 0,
  'Lunes': 1,
  'Martes': 2,
  'Miércoles': 3,
  'Jueves': 4,
  'Viernes': 5,
  'Sábado': 6,
};

// Calcula el siguiente momento válido según los días y la hora configurados.
function getNextNotificationTime(breakItem: Pausa): number | null {
  const now = new Date();
  const [hours, minutes] = breakItem.hora.split(':').map(Number);
  
  const sortedDays = breakItem.dias.map(day => dayNameToNumber[day]).sort((a,b) => a - b);
  if(sortedDays.length === 0) return null;

  for (let i = 0; i < 8; i++) { // Check up to 8 days to be safe
    const date = new Date();
    date.setDate(now.getDate() + i);
    const dayOfWeek = date.getDay();

    if (sortedDays.includes(dayOfWeek)) {
      const potentialNotificationTime = new Date(date);
      potentialNotificationTime.setHours(hours, minutes, 0, 0);

      if (potentialNotificationTime > now) {
        return potentialNotificationTime.getTime();
      }
    }
  }

  return null;
}


// Programa el siguiente recordatorio y reemplaza cualquier temporizador previo de la misma pausa.
export async function scheduleNotification(breakItem: Pausa) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  
  const registration = await navigator.serviceWorker.ready;
  if (!registration || !registration.showNotification) {
    return;
  }

  await cancelNotification(breakItem.id);

  const notificationTime = getNextNotificationTime(breakItem);
  
  if (notificationTime) {
    console.log(`Scheduling notification for '${breakItem.nombre}' at ${new Date(notificationTime).toLocaleString()}.`);
    
    const notificationOptions = {
        tag: breakItem.id,
        body: breakItem.recordatorio || `Es momento de '${breakItem.nombre}'.`,
        icon: '/logo192.svg',
        badge: '/logo-mono.svg',
        vibrate: [200, 100, 200],
        silent: false,
        requireInteraction: true,
        data: {
          url: `/break/${breakItem.id}`,
        },
        actions: [
            { action: 'view', title: 'Ver Pausa' },
            { action: 'skip', title: 'Saltar Pausa' }
        ]
    };
    
    if ('showTrigger' in Notification.prototype) {
        try {
          await registration.showNotification('¡Hora de tu pausa activa!', {
              ...notificationOptions,
              timestamp: notificationTime,
              showTrigger: new TimestampTrigger(notificationTime),
          });
          console.log("Scheduled notification with Trigger.");
        } catch(e) {
            console.error("Error scheduling with Trigger, using fallback: ", e);
            const delay = notificationTime - Date.now();
            if (delay > 0) {
              const timerId = setTimeout(() => {
                  registration.showNotification('¡Hora de tu pausa activa!', notificationOptions);
                  delete timeoutStore[breakItem.id];
              }, delay);
              timeoutStore[breakItem.id] = timerId;
            }
        }
    } else {
        const delay = notificationTime - Date.now();
        if(delay > 0) {
           const timerId = setTimeout(() => {
                registration.showNotification('¡Hora de tu pausa activa!', notificationOptions);
                console.log("Scheduled notification with Fallback (setTimeout).");
                delete timeoutStore[breakItem.id];
            }, delay);
           timeoutStore[breakItem.id] = timerId;
        }
    }
  }
}

// Cancela el temporizador existente para evitar notificaciones pendientes.
export async function cancelNotification(breakId: string) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    if (!registration) return;

    if (timeoutStore[breakId]) {
      clearTimeout(timeoutStore[breakId]);
      delete timeoutStore[breakId];
      console.log(`Cleared fallback timer for break ${breakId}`);
    }
    const notifications = await registration.getNotifications({ tag: breakId });
    notifications.forEach(notification => notification.close());

    if ('showTrigger' in Notification.prototype) {
        await registration.showNotification('Cancelling notification', {
            tag: breakId,
            body: '',
            silent: true,
            showTrigger: new TimestampTrigger(0),
        });
    }

    console.log(`Cancelled notification for break ${breakId}`);
  } catch (error) {
     console.error("Error cancelling notification: ", error)
  }
}

export async function syncAllNotifications(breaks: Pausa[]) {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('Notification' in window) || Notification.permission !== 'granted') return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration) return;

      const activeBreakIds = new Set(breaks.map(b => b.id));
      const notifications = await registration.getNotifications();
      for(const notification of notifications) {
          notification.close();
          await cancelNotification(notification.tag);
      }
      
      for (const id in timeoutStore) {
        clearTimeout(timeoutStore[id]);
        delete timeoutStore[id];
      }

      console.log(`Scheduling notifications for ${breaks.filter(b => b.activa).length} active breaks.`);
      for (const breakItem of breaks) {
          if(breakItem.activa) {
              await scheduleNotification(breakItem);
          }
      }
      console.log("All notifications have been re-synced.");
    } catch (error) {
      console.error("Error during notification sync: ", error);
    }
}
