import { PartialType } from '@nestjs/mapped-types';
import { CreateBudgetDto } from './create-budget.dto';
import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';
import { BudgetStatus } from '../interfaces/budget.interface';

export class UpdateBudgetDto extends PartialType(CreateBudgetDto) {
  @IsOptional()
  @IsString()
  @IsIn(Object.values(BudgetStatus), { message: 'Estado no válido' })
  estado?: BudgetStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Las notas internas no pueden exceder 1000 caracteres' })
  notasInternas?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Las notas del estado no pueden exceder 200 caracteres' })
  notasEstado?: string;
}
