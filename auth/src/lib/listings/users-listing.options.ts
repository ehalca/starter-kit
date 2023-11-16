import {
  AbstractListingOptionsRefine,
  AbstractListingOptionsSchema,
} from '@ehalca/db';
import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';

export const UserListingOptionsSchema = AbstractListingOptionsSchema.extend({
  searchRule: z.string().optional().default('like'),
  searchCol: z
    .string()
    .array()
    .optional()
    .default(['email', 'firstName', 'lastName', 'company']),
});

export class UserListingOptions extends createZodDto(
  UserListingOptionsSchema.superRefine(AbstractListingOptionsRefine)
) {}
