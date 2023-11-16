import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';


export const ActivationDtoSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6),
});

export class ActivationDto extends createZodDto(ActivationDtoSchema) {}