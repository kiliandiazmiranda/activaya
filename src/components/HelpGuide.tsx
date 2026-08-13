"use client";
// Guía de ayuda con instrucciones para utilizar las funciones principales.

import React from 'react';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlusCircle, BarChart3 } from 'lucide-react';

const HelpGuide = () => {
  return (
    <div className="py-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div className="flex items-center gap-3">
              <PlusCircle className="h-5 w-5 text-primary" />
              <span className="font-semibold">¿Cómo crear una Pausa Activa?</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2 pl-2">
            <p className="text-muted-foreground">
              Sigue estos simples pasos para programar tus pausas y empezar a cuidarte.
            </p>
            <div>
              <h4 className="font-semibold mb-2">Paso 1: Haz clic en "Crear Pausa Activa"</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Encontrarás este botón en la esquina superior derecha de la pantalla principal.
              </p>
              <Image 
                src="/helpimg/create-button.png"
                alt="Botón para crear pausa activa"
                width={400}
                height={80}
                className="rounded-md border object-cover"
                data-ai-hint="button create"
              />
            </div>
             <div>
              <h4 className="font-semibold mb-2">Paso 2: Completa el formulario</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Dale un nombre a tu pausa, elige los días, la hora y la duración. ¡Y listo!
              </p>
              <Image 
                src="/helpimg/form.png"
                alt="Formulario de creación de pausa"
                width={400}
                height={250}
                className="rounded-md border object-cover"
                data-ai-hint="form fields"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>
            <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="font-semibold">¿Cómo ver tus Estadísticas?</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2 pl-2">
            <p className="text-muted-foreground">
              Visualiza tu progreso y mantente motivado.
            </p>
            <div>
                <h4 className="font-semibold mb-2">Paso 1: Haz clic en el icono de Gráfico</h4>
                <p className="text-sm text-muted-foreground mb-2">
                    Está ubicado en la cabecera, junto al botón de crear pausa.
                </p>
                <Image 
                    src="/helpimg/stats-button.png"
                    alt="Botón de estadísticas"
                    width={400}
                    height={80}
                    className="rounded-md border object-cover"
                    data-ai-hint="button stats"
                />
            </div>
            <div>
                <h4 className="font-semibold mb-2">Paso 2: Analiza tu progreso</h4>
                <p className="text-sm text-muted-foreground mb-2">
                    Verás un resumen de tus pausas completadas, saltadas, el tiempo total activo y tus ejercicios más frecuentes.
                </p>
                <Image 
                    src="/helpimg/stats-page.png"
                    alt="Página de estadísticas"
                    width={400}
                    height={250}
                    className="rounded-md border object-cover"
                    data-ai-hint="dashboard charts"
                />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default HelpGuide;
