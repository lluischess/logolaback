import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export class ReorderProductDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsEnum(['up', 'down'])
  direction: 'up' | 'down';
}
