"use client";
// Lista de pausas almacenadas y acciones para administrarlas.

import React, { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Pausa } from '@/lib/types';
import BreakCard from './BreakCard';
import { AnimatePresence, motion } from 'framer-motion';
import { scheduleNotification, cancelNotification } from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';

interface BreakListProps {
  onEdit: (id: string) => void;
}

const BreakList: React.FC<BreakListProps> = ({ onEdit }) => {
  const [breaks, setBreaks] = useLocalStorage<Pausa[]>('breaks', []);
  const [hasMounted, setHasMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setHasMounted(true);
  }, []);

    // Elimina la pausa y cancela su recordatorio si estaba activa.
  const handleDelete = (id: string) => {
    const breakToDelete = breaks.find(b => b.id === id);
    if(breakToDelete && breakToDelete.activa) {
        cancelNotification(id);
    }
    const updatedBreaks = breaks.filter(b => b.id !== id);
    setBreaks(updatedBreaks);
    toast({
        title: "Pausa eliminada",
        description: "La pausa activa ha sido eliminada.",
    });
  };
  
    // Actualiza el estado de la pausa y sincroniza su notificación.
  const toggleBreak = (id: string, activa: boolean) => {
    const updatedBreaks = breaks.map(b => b.id === id ? { ...b, activa } : b);
    setBreaks(updatedBreaks);
    
    const currentBreak = updatedBreaks.find(b => b.id === id);
    if (currentBreak) {
        if(activa) {
            scheduleNotification(currentBreak);
        } else {
            cancelNotification(id);
        }
    }

     toast({
        title: activa ? "Pausa Activada" : "Pausa Desactivada",
        description: `Las notificaciones para esta pausa han sido ${activa ? 'habilitadas' : 'deshabilitadas'}.`,
    });
  };
  
  if (!hasMounted) {
    return (
      <div className="text-center py-16 px-6 border-2 border-dashed rounded-lg">
        <h2 className="text-xl font-semibold text-muted-foreground">Cargando pausas...</h2>
        <p className="text-muted-foreground mt-2">Por favor, espera.</p>
      </div>
    );
  }

  if (breaks.length === 0) {
    return (
      <div className="text-center py-16 px-6 border-2 border-dashed rounded-lg">
        <h2 className="text-xl font-semibold text-muted-foreground">No tienes pausas activas programadas.</h2>
        <p className="text-muted-foreground mt-2">¡Crea una para empezar a cuidarte!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {breaks.map(b => (
          <motion.div
            key={b.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <BreakCard 
              breakData={b} 
              onDelete={() => handleDelete(b.id)} 
              onEdit={() => onEdit(b.id)}
              onToggle={(activa) => toggleBreak(b.id, activa)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default BreakList;
