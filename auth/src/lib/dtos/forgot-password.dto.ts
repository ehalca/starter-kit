import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';


export const ForgotPasswordDtoSchema = z.object({
    email: z.string().email(),
});

export class ForgotPasswordDto extends createZodDto(ForgotPasswordDtoSchema) {}