import { IsString, IsIn, IsNotEmpty } from 'class-validator';

export class ReorderCategoryDto {
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsIn(['up', 'down'], { message: 'La dirección debe ser "up" o "down"' })
  direction: 'up' | 'down';
}
