"use client";
// Página de estadísticas: presenta el progreso y el historial de pausas y ejercicios.

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock, Zap, CheckCircle, XCircle } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Estadisticas } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const StatCard = ({ title, value, icon: Icon, unit = '' }: { title: string, value: string | number, icon: React.ElementType, unit?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}{unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}</div>
    </CardContent>
  </Card>
);

export default function StatsPage() {
  const [stats] = useLocalStorage<Estadisticas>('activa-stats', {
    pausasCompletadas: 0,
    pausasSaltadas: 0,
    tiempoTotalActivo: 0,
    conteoPorEjercicio: {},
    mediaUrlPorEjercicio: {},
    tiempoPorEjercicio: {},
  });

  const chartData = React.useMemo(() => {
    if (!stats.conteoPorEjercicio || Object.keys(stats.conteoPorEjercicio).length === 0) {
      return [];
    }
    const maxCount = Math.max(...Object.values(stats.conteoPorEjercicio));

    return Object.entries(stats.conteoPorEjercicio)
      .map(([name, count]) => ({ 
          name, 
          count, 
          mediaUrl: stats.mediaUrlPorEjercicio[name] || '',
          totalTime: (stats.tiempoPorEjercicio && stats.tiempoPorEjercicio[name]) || 0,
          percentage: maxCount > 0 ? (count / maxCount) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [stats]);


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="container mx-auto p-4 sm:p-6 md:p-8 flex-grow">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/" passHref>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold font-headline text-foreground">
              Tus Estadísticas
            </h1>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard 
            title="Pausas Completadas" 
            value={stats.pausasCompletadas} 
            icon={CheckCircle} 
          />
          <StatCard 
            title="Pausas Saltadas" 
            value={stats.pausasSaltadas} 
            icon={XCircle} 
          />
          <StatCard 
            title="Tiempo total hecho" 
            value={formatTime(stats.tiempoTotalActivo)} 
            icon={Clock}
          />
          <StatCard 
            title="Total Sesiones" 
            value={stats.pausasCompletadas + stats.pausasSaltadas} 
            icon={Zap}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ejercicios Más Frecuentes</CardTitle>
            <CardDescription>
                Tus ejercicios más realizados y el tiempo total dedicado a cada uno.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="space-y-4">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-4">
                    {item.mediaUrl && (
                      <Image 
                          src={item.mediaUrl}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="rounded-md bg-muted object-cover h-10 w-10"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <div className="text-right">
                             <p className="text-sm text-muted-foreground">{item.count} {item.count > 1 ? 'veces' : 'vez'}</p>
                             <p className="text-xs font-mono text-primary">{formatTime(item.totalTime)}</p>
                          </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <div className="flex items-center justify-center h-40 text-muted-foreground text-center">
                    Aún no has completado ningún ejercicio. ¡Vamos!
                </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
