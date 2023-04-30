import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PaginatorInputType {
  @IsOptional()
  @IsString()
  sortBy: string;

  @IsOptional()
  @IsString()
  @IsIn(['desc', 'asc'])
  sortDirection: 'desc' | 'asc';

  @IsOptional()
  @IsInt()
  @Min(1)
  pageNumber: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize: number;
}
