import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';


export const RegistrationDtoSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(20),
    firstName: z.string().min(2).max(20).optional(),
    lastName: z.string().min(2).max(20).optional(),
    company: z.string().min(2).max(20).optional(),
    termsAgreement: z.boolean().optional().default(true),
    securityAgreement: z.boolean().optional().default(true),
});

export class RegistrationDto extends createZodDto(RegistrationDtoSchema) {}