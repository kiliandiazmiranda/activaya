"use client";
// Motor de una sesión: selecciona ejercicios, controla el temporizador y registra estadísticas.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Pausa, Ejercicio, Estadisticas } from '@/lib/types';
import { ejercicios as exerciseList } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import * as LucideIcons from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { syncAllNotifications } from '@/lib/notifications';

interface BreakSessionProps {
  breakId: string;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const BreakSession: React.FC<BreakSessionProps> = ({ breakId }) => {
  const router = useRouter();
  const { toast } = useToast();
  // Recupera las pausas configuradas para localizar la pausa que se va a ejecutar.
  const [breaks] = useLocalStorage<Pausa[]>('breaks', []);
  // Las estadísticas se guardan localmente para conservar el progreso entre sesiones.
  const [stats, setStats] = useLocalStorage<Estadisticas>('activa-stats', {
    pausasCompletadas: 0,
    pausasSaltadas: 0,
    tiempoTotalActivo: 0,
    conteoPorEjercicio: {},
    mediaUrlPorEjercicio: {},
    tiempoPorEjercicio: {},
  });
  
  const [breakData, setBreakData] = useState<Pausa | null>(null);
  const [exercises, setExercises] = useState<Ejercicio[]>([]);
  // El índice determina qué ejercicio se muestra y permite avanzar por la sesión.
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [exerciseTimeLeft, setExerciseTimeLeft] = useState(0);
  const [hasFinished, setHasFinished] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const currentExercise = useMemo(() => exercises[currentExerciseIndex], [exercises, currentExerciseIndex]);

  useEffect(() => {
    const foundBreak = breaks.find(b => b.id === breakId);
    if (foundBreak) {
      setBreakData(foundBreak);
      const totalDurationSeconds = foundBreak.duracion * 60;

      let selectedExercises: Ejercicio[] = [];
      let accumulatedTime = 0;
      const shuffled = shuffleArray(exerciseList);
      
      let i = 0;
      while(accumulatedTime < totalDurationSeconds && i < shuffled.length) {
          const exercise = shuffled[i];
          if (accumulatedTime + exercise.duracion <= totalDurationSeconds) {
              selectedExercises.push(exercise);
              accumulatedTime += exercise.duracion;
          }
          i++;
      }
      
      if (selectedExercises.length === 0 && shuffled.length > 0) {
        const shortestExercise = [...shuffled].sort((a,b) => a.duracion - b.duracion)[0];
        if (shortestExercise.duracion <= totalDurationSeconds) {
          selectedExercises.push(shortestExercise);
        }
      }
      
      if(selectedExercises.length > 0) {
          setExercises(selectedExercises);
          setExerciseTimeLeft(selectedExercises[0].duracion);
      }
      setIsReady(true); 
    } else {
       const timer = setTimeout(() => {
        const stillNoBreak = !breaks.find(b => b.id === breakId)
        if (stillNoBreak) {
          toast({
            variant: "destructive",
            title: "Pausa no encontrada",
            description: "No se pudo encontrar la pausa activa. Volviendo al inicio.",
          });
          router.push('/');
        }
       }, 1000);
       return () => clearTimeout(timer);
    }
  }, [breakId, breaks, router, toast]);

  const totalSessionDuration = useMemo(() => exercises.reduce((acc, ex) => acc + ex.duracion, 0), [exercises]);
  
  const sessionTimeLeft = useMemo(() => {
    if (!exercises || exercises.length === 0 || !currentExercise) return 0;
    const remainingExercises = exercises.slice(currentExerciseIndex + 1);
    const remainingTimeFromOtherExercises = remainingExercises.reduce((acc, ex) => acc + ex.duracion, 0);
    return remainingTimeFromOtherExercises + exerciseTimeLeft;
  }, [exercises, currentExerciseIndex, exerciseTimeLeft, currentExercise]);

  const updateStatsOnCompletion = useCallback(() => {
    if (!breakData) return;
    
    setStats(prevStats => {
        const timeSpentInSession = totalSessionDuration - sessionTimeLeft;
        const newStats = { ...prevStats };
        newStats.pausasCompletadas = (prevStats.pausasCompletadas || 0) + 1;
        // This part is now handled by `addCompletedExerciseToStats` to be more accurate
        // newStats.tiempoTotalActivo = (prevStats.tiempoTotalActivo || 0) + timeSpentInSession;
        return newStats;
    });
  }, [breakData, setStats, totalSessionDuration, sessionTimeLeft]);
  
  const updateStatsOnSkip = useCallback(() => {
     if (!breakData) return;
     setStats(prevStats => ({ ...prevStats, pausasSaltadas: (prevStats.pausasSaltadas || 0) + 1 }));
  }, [breakData, setStats]);
  
  const addCompletedExerciseToStats = useCallback((exercise: Ejercicio) => {
    setStats(prevStats => {
      const newConteo = { ...prevStats.conteoPorEjercicio };
      newConteo[exercise.nombre] = (newConteo[exercise.nombre] || 0) + 1;
      
      const newMediaUrl = { ...prevStats.mediaUrlPorEjercicio };
      newMediaUrl[exercise.nombre] = exercise.mediaUrl;

      const newTiempoPorEjercicio = { ...(prevStats.tiempoPorEjercicio || {}) };
      newTiempoPorEjercicio[exercise.nombre] = (newTiempoPorEjercicio[exercise.nombre] || 0) + exercise.duracion;

      const newTiempoTotalActivo = (prevStats.tiempoTotalActivo || 0) + exercise.duracion;

      return { 
        ...prevStats, 
        conteoPorEjercicio: newConteo, 
        mediaUrlPorEjercicio: newMediaUrl,
        tiempoPorEjercicio: newTiempoPorEjercicio,
        tiempoTotalActivo: newTiempoTotalActivo
      };
    });
  }, [setStats]);

  const currentExerciseDuration = currentExercise ? currentExercise.duracion : 0;
  
  const exerciseProgress = useMemo(() => {
      if (currentExerciseDuration > 0) {
          return (currentExerciseDuration - exerciseTimeLeft) / currentExerciseDuration * 100;
      }
      return 0;
  }, [currentExerciseDuration, exerciseTimeLeft]);

  const sessionProgress = useMemo(() => totalSessionDuration > 0 ? (totalSessionDuration - sessionTimeLeft) / totalSessionDuration * 100 : 0, [totalSessionDuration, sessionTimeLeft]);


  const finishSession = useCallback((message?: {title: string, description: string}) => {
    setHasFinished(true);
    updateStatsOnCompletion();
    toast({
      title: message?.title || "¡Pausa completada!",
      description: message?.description || `¡Buen trabajo! Has completado tu pausa de ${breakData?.nombre}.`,
    });
    syncAllNotifications(breaks);
    setTimeout(() => router.push('/'), 3000);
  }, [updateStatsOnCompletion, toast, breakData, breaks, router]);

  useEffect(() => {
    if (!isReady || isPaused || hasFinished || !breakData || !currentExercise) return;

    if (exerciseTimeLeft <= 0 && currentExerciseIndex >= exercises.length - 1) {
        addCompletedExerciseToStats(currentExercise);
        finishSession();
        return;
    }

    const timer = setInterval(() => {
      setExerciseTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime > 0) {
          return newTime;
        }
        
        // Exercise finished
        addCompletedExerciseToStats(currentExercise);

        if (currentExerciseIndex < exercises.length - 1) {
          const nextIndex = currentExerciseIndex + 1;
          setCurrentExerciseIndex(nextIndex);
          return exercises[nextIndex].duracion;
        }
        
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isReady, isPaused, hasFinished, breakData, exercises, currentExerciseIndex, currentExercise, finishSession, addCompletedExerciseToStats]);

  const skipSession = useCallback(() => {
    if (!breakData) return;
    
    updateStatsOnSkip();
    syncAllNotifications(breaks);
    toast({
      title: 'Pausa saltada',
      description: 'La pausa se ha saltado. La próxima se notificará a su hora programada.',
    });
    router.push('/');
    
  }, [breakData, breaks, router, toast, updateStatsOnSkip]);

  const skipExercise = useCallback(() => {
    if (!currentExercise || hasFinished) return;
    
    // Don't count the skipped exercise
    
    const currentExerciseNames = new Set(exercises.map(e => e.nombre));
    const availableReplacements = shuffleArray(exerciseList.filter(e => !currentExerciseNames.has(e.nombre)));
    
    const replacement = availableReplacements.length > 0 ? availableReplacements[0] : null;

    if (replacement) {
        setExercises(prevExercises => {
            const newExercises = [...prevExercises];
            newExercises[currentExerciseIndex] = replacement;
            setExerciseTimeLeft(replacement.duracion);
            return newExercises;
        });
        toast({ title: "Ejercicio Cambiado", description: `Cambiado a: ${replacement.nombre}` });
    } else {
        // If no replacement, just go to next exercise if possible
        if (currentExerciseIndex >= exercises.length - 1) {
            finishSession({
                title: 'Pausa completada',
                description: 'Has completado todos los ejercicios disponibles.',
            });
        } else {
            const nextIndex = currentExerciseIndex + 1;
            setCurrentExerciseIndex(nextIndex);
            setExerciseTimeLeft(exercises[nextIndex].duracion);
        }
    }
  }, [currentExercise, exercises, currentExerciseIndex, hasFinished, finishSession, toast]);
  
  if (!breakData || !isReady) {
    return (
      <Card className="w-full max-w-md text-center p-8">
        <CardTitle>Cargando pausa...</CardTitle>
      </Card>
    );
  }
  
  if (hasFinished) {
    return (
       <Card className="w-full max-w-md mx-auto shadow-2xl">
         <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">¡Felicidades!</CardTitle>
         </CardHeader>
         <CardContent className="flex flex-col items-center text-center space-y-4">
            <LucideIcons.PartyPopper className="h-20 w-20 text-primary" />
            <p className="text-lg">Completaste tu pausa activa.</p>
            <p className="text-muted-foreground">Serás redirigido en unos segundos...</p>
         </CardContent>
       </Card>
    )
  }

  if (!currentExercise) {
     return (
       <Card className="w-full max-w-md text-center p-8">
         <CardTitle>No hay ejercicios para esta pausa.</CardTitle>
         <Button onClick={() => router.push('/')} className="mt-4">Volver al inicio</Button>
       </Card>
     );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">{breakData.nombre}</CardTitle>
        <p className="text-muted-foreground">
          {`Ejercicio ${currentExerciseIndex + 1} de ${exercises.length}`}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center space-y-6">
        <div className="bg-primary/10 rounded-full w-48 h-48 flex items-center justify-center overflow-hidden">
            <Image 
              src={currentExercise.mediaUrl} 
              alt={currentExercise.nombre}
              width={192}
              height={192}
              className="object-cover w-full h-full"
            />
        </div>
        <h3 className="text-xl font-semibold">{currentExercise.nombre}</h3>
        <p className="text-muted-foreground min-h-[40px]">{currentExercise.descripcion}</p>
        
        <div>
          <p className="text-sm text-muted-foreground mb-1">Tiempo del ejercicio</p>
          <Progress value={exerciseTimeLeft > 0 ? exerciseProgress : 100} className="w-48 h-2" />
          <p className="font-mono text-lg mt-1">{exerciseTimeLeft > 0 ? `${exerciseTimeLeft}s` : '¡Hecho!'}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-1">Tiempo total de la pausa</p>
          <Progress value={sessionProgress} className="w-64" />
          <p className="font-mono text-lg mt-1">{Math.floor(sessionTimeLeft / 60)}:{('0' + (sessionTimeLeft % 60)).slice(-2)}</p>
        </div>

      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <div className="flex gap-2">
            <Button onClick={() => setIsPaused(!isPaused)} className="w-full sm:w-auto">
              {isPaused ? <LucideIcons.Play className="mr-2 h-4 w-4" /> : <LucideIcons.Pause className="mr-2 h-4 w-4" />}
              {isPaused ? 'Reanudar' : 'Pausar'}
            </Button>
            <Button variant="outline" onClick={skipExercise} disabled={hasFinished}>
                <LucideIcons.SkipForward className="mr-2 h-4 w-4"/>
                Saltar
            </Button>
        </div>
        <Button variant="destructive" onClick={skipSession}>
          <LucideIcons.XCircle className="mr-2 h-4 w-4" /> Terminar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BreakSession;
