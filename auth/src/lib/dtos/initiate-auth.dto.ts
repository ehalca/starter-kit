import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const InitiateLoginDtoSchema = z.object({
  email: z.string().email(),
});

export class InitiateLoginDto extends createZodDto(InitiateLoginDtoSchema) {}
