import { z } from 'zod';

export const DispositivoCreateSchema = z.object({
  serial: z.string().min(1, 'Serial é obrigatório'),
  modelo: z.string().default('ESP32-WROOM-32'),
});

export const DispositivoUpdateSchema = z.object({
  modelo: z.string().optional(),
});

export const DispositivoSensoresSchema = z.object({
  acelerometro: z.boolean().optional(),
  giroscopio: z.boolean().optional(),
  magnetometro: z.boolean().optional(),
  barometro: z.boolean().optional(),
});

export const DispositivoVinculoSchema = z.object({
  veiculo_id: z.string().uuid().nullable(),
});