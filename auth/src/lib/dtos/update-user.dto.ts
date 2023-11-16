import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';


export const UpdateUserDtoSchema = z.object({
    password: z.string().min(8).max(20).optional(),
    firstName: z.string().min(2).max(20).optional(),
    lastName: z.string().min(2).max(20).optional(),
    company: z.string().min(2).max(20).optional(),
    phone: z.string().min(2).max(20).optional(),
});

export class UpdateUserDto extends createZodDto(UpdateUserDtoSchema) {}