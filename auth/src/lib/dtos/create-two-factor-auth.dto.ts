import { TwoFactorAuthType } from '../entities/two-factor-authentication.entity';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const CreateTwoFactorAuthDtoSchema = z.object({
  type: z.nativeEnum(TwoFactorAuthType),
  password: z.string().min(8).max(20),
});

export class CreateTwoFactorAuthDto extends createZodDto(
  CreateTwoFactorAuthDtoSchema
) {}
