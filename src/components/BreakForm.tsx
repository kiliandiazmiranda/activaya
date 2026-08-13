"use client";
// Formulario para crear o editar pausas activas con validación de datos.

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Pausa, Day } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { scheduleNotification } from '@/lib/notifications';

const daysOfWeek: Day[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/* Valida los datos antes de crear o actualizar una pausa en localStorage. */
const formSchema = z.object({
  nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  dias: z.array(z.string()).refine(value => value.some(item => item), {
    message: 'Debes seleccionar al menos un día.',
  }),
  hora: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Formato de hora inválido.' }),
  duracion: z.enum(['5', '10', '15'], { required_error: 'Debes seleccionar una duración.' }),
  recordatorio: z.string().optional(),
});

interface BreakFormProps {
  breakId: string | null;
  onFinished: () => void;
}

const BreakForm: React.FC<BreakFormProps> = ({ breakId, onFinished }) => {
  const [breaks, setBreaks] = useLocalStorage<Pausa[]>('breaks', []);
  const { toast } = useToast();

  const getInitialValues = (id: string | null): z.infer<typeof formSchema> => {
    if (id) {
      const existingBreak = breaks.find(b => b.id === id);
      if (existingBreak) {
        return {
          nombre: existingBreak.nombre,
          dias: existingBreak.dias,
          hora: existingBreak.hora,
          duracion: String(existingBreak.duracion) as '5' | '10' | '15',
          recordatorio: existingBreak.recordatorio || '',
        };
      }
    }
    return {
      nombre: '',
      dias: [],
      hora: '10:00',
      duracion: '5',
      recordatorio: '',
    };
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialValues(breakId),
  });
  
  useEffect(() => {
    form.reset(getInitialValues(breakId));
  }, [breakId, breaks, form]);


  // Transforma los datos validados y persiste la pausa nueva o editada.
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const isEditing = !!breakId;
    let newBreakData: Pausa;

    if (isEditing) {
       const existingBreak = breaks.find(b => b.id === breakId);
       newBreakData = {
         id: breakId,
         nombre: values.nombre,
         dias: values.dias as Day[],
         hora: values.hora,
         duracion: parseInt(values.duracion, 10) as 5 | 10 | 15,
         recordatorio: values.recordatorio,
         activa: existingBreak?.activa ?? true,
       };
      const updatedBreaks = breaks.map(b => (b.id === breakId ? newBreakData : b));
      setBreaks(updatedBreaks);
      toast({ title: "Pausa actualizada", description: "Tu pausa activa ha sido guardada." });
    } else {
      newBreakData = {
        id: uuidv4(),
        nombre: values.nombre,
        dias: values.dias as Day[],
        hora: values.hora,
        duracion: parseInt(values.duracion, 10) as 5 | 10 | 15,
        recordatorio: values.recordatorio,
        activa: true,
      };
      setBreaks([...breaks, newBreakData]);
      toast({ title: "Pausa creada", description: "Tu nueva pausa activa está lista." });
    }
    
    if (newBreakData.activa) {
        scheduleNotification(newBreakData);
    }
    onFinished();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la pausa</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Estiramientos matutinos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dias"
          render={() => (
            <FormItem>
              <FormLabel>Días de la semana</FormLabel>
               <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {daysOfWeek.map((day) => (
                  <FormField
                    key={day}
                    control={form.control}
                    name="dias"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={day}
                          className="flex flex-row items-start space-x-2 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(day)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), day])
                                  : field.onChange(
                                      (field.value || []).filter(
                                        (value) => value !== day
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm">
                            {day}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hora"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hora</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duracion"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Duración (minutos)</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={String(field.value)}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="5" />
                    </FormControl>
                    <FormLabel className="font-normal">5</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="10" />
                    </FormControl>
                    <FormLabel className="font-normal">10</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="15" />
                    </FormControl>
                    <FormLabel className="font-normal">15</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="recordatorio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recordatorio (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Tomar agua" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onFinished}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Form>
  );
};

export default BreakForm;
