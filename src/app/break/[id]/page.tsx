// Página de ejecución de una pausa activa identificada por su ID.
import React from 'react';
import BreakSession from '@/components/BreakSession';

interface BreakPageProps {
  params: { id: string };
}

export default function BreakPage({ params }: BreakPageProps) {
  const { id } = params;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="flex-grow flex items-center justify-center w-full">
        <BreakSession breakId={id} />
      </div>
    </div>
  );
}
