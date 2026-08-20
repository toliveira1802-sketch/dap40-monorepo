import { z } from "zod";
import { OrderStatusEnum } from "../enums";

export const ClientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  phone: z.string().min(10, "Telefone inválido"),
  document: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().nullable()
});

export const VehicleSchema = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string().uuid(),
  plate: z.string().min(7, "Placa inválida").max(8),
  brand: z.string().min(2),
  model: z.string().min(2),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  chassis: z.string().optional().nullable()
});

export const ServiceOrderSchema = z.object({
  id: z.string().uuid().optional(),
  vehicleId: z.string().uuid(),
  status: OrderStatusEnum.default("CHECKIN"),
  mileage: z.number().nonnegative().optional().nullable(),
  fuelLevel: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
  totalAmount: z.number().nonnegative().default(0)
});

export type Client = z.infer<typeof ClientSchema>;
export type Vehicle = z.infer<typeof VehicleSchema>;
export type ServiceOrder = z.infer<typeof ServiceOrderSchema>;
