import { createZodDto } from 'nestjs-zod';
import { RefinementCtx, z } from 'nestjs-zod/z';

export enum SortDir {
    ASC = 'ASC',
    DESC = 'DESC'
  }

export const AbstractListingOptionsSchema = z.object({
    sortBy: z.string().optional(),
    // @ValidateIf((o) => !!o.sortBy
    sortDir: z.nativeEnum(SortDir).optional(),
  
    query: z.string().optional(),
    // @IsOptional()
    // @IsInt()
    // @Type(() => Number)
    page : z.coerce.number().optional().default(1).transform((v) => Math.round(v)),
    perPage : z.coerce.number().optional().default(20).transform((v) => Math.round(v)),
  
    searchRule: z.string().optional().default('='),
    searchCol: z.string().array().optional(),
})

export const AbstractListingOptionsRefine = ({sortBy, sortDir}: {sortBy?: string, sortDir?: SortDir}, rfCtx: RefinementCtx) => {
    if(sortBy && !sortDir){
        return rfCtx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'sortDir is required when sortBy is provided',
            path: ['sortDir']
        })
    }
}

export class AbstractListingOptions extends createZodDto(AbstractListingOptionsSchema.superRefine(AbstractListingOptionsRefine)) {}
