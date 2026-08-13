"use client";
// Tarjeta que muestra una pausa y permite activarla, editarla o eliminarla.

import React, { useState } from 'react';
import type { Pausa } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Clock, Calendar, Edit, Trash2, Bell, BellOff, Play } from 'lucide-react';
import { Badge } from './ui/badge';
import Link from 'next/link';

interface BreakCardProps {
  breakData: Pausa;
  onDelete: () => void;
  onEdit: () => void;
  onToggle: (activa: boolean) => void;
}

const BreakCard: React.FC<BreakCardProps> = ({ breakData, onDelete, onEdit, onToggle }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleToggle = (checked: boolean) => {
    onToggle(checked);
  };

  return (
    <Card className="flex flex-col h-full bg-card shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-xl mb-1 pr-4">{breakData.nombre}</CardTitle>
          <Switch
            checked={breakData.activa}
            onCheckedChange={handleToggle}
            aria-label="Activar o desactivar pausa"
          />
        </div>
        <CardDescription className="flex items-center gap-2 text-sm">
          {breakData.activa ? <><Bell className="h-4 w-4 text-green-500" /> Activada</> : <><BellOff className="h-4 w-4 text-red-500" /> Desactivada</>}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <span>{breakData.hora} - {breakData.duracion} minutos</span>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary mt-1" />
            <div className="flex flex-wrap gap-1">
              {breakData.dias.map(dia => (
                <Badge key={dia} variant="secondary" className="font-normal">{dia.substring(0, 3)}</Badge>
              ))}
            </div>
          </div>
          {breakData.recordatorio && (
            <p className="text-muted-foreground pt-2 italic">"{breakData.recordatorio}"</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4">
         <Link href={`/break/${breakData.id}`} passHref>
             <Button variant="outline">
                 <Play className="h-4 w-4 mr-2" />
                 Iniciar ahora
             </Button>
         </Link>
        <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="h-5 w-5" />
              <span className="sr-only">Editar</span>
            </Button>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-5 w-5" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente tu pausa activa.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BreakCard;
