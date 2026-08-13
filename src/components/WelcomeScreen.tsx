"use client";
// Pantalla inicial que presenta la aplicación antes de acceder al contenido.

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onContinue: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleContinue = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence onExitComplete={onContinue}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="mb-8">
              <Image
                src="/welcome.png"
                alt="Persona haciendo ejercicio"
                width={200}
                height={200}
                data-ai-hint="stretching yoga"
                className="rounded-full object-cover shadow-lg mx-auto"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary mb-4">
              ¡Bienvenido a ActivaYA!
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Tu asistente personal para integrar pausas activas en tu día a día. Comienza a cuidarte, tu cuerpo y mente te lo agradecerán.
            </p>
            <Button onClick={handleContinue} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Continuar
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;
