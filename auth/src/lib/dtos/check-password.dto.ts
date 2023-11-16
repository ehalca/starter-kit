import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';


export const CheckPasswordDtoSchema = z.object({
    email: z.string().email(),
    id: z.string(),
});

export class CheckPasswordDto extends createZodDto(CheckPasswordDtoSchema) {}