import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PaginatorInputType {
  @IsOptional()
  @IsString()
  sortBy = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['desc', 'asc'])
  sortDirection: 'desc' | 'asc' = 'desc';

  @IsOptional()
  @IsInt()
  @Min(1)
  pageNumber = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize = 10;
}
