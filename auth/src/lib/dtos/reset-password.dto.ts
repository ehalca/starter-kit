import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';


export const ResetPasswordDtoSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(20),
    code: z.string().length(6),
    tfaCode: z.string().length(6).optional(),
});

export class ResetPasswordDto extends createZodDto(ResetPasswordDtoSchema) {}