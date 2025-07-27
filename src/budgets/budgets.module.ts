import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { Budget, BudgetSchema } from './schemas/budget.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Budget.name, schema: BudgetSchema }]),
    AuthModule
  ],
  controllers: [BudgetsController],
  providers: [BudgetsService],
  exports: [BudgetsService]
})
export class BudgetsModule {}
