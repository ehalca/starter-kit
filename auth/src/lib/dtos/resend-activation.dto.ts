import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';


export const ResendActivationDtoSchema = z.object({
    email: z.string().email(),
});

export class ResendActivationDto extends createZodDto(ResendActivationDtoSchema) {}