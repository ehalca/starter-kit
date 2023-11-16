import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const LoginDtoSchema = z.object({
  email: z.string().email(),
  secret: z.string(),
  tfaCode: z.string().optional(),
});

export class LoginDto extends createZodDto(LoginDtoSchema) {}
