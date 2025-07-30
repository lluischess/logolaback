import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  UseGuards 
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, UpdateBudgetDto, QueryBudgetDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  // Endpoint público para crear presupuesto desde el carrito
  @Post()
  create(@Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.create(createBudgetDto);
  }

  // Endpoints protegidos para administradores
  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() queryDto: QueryBudgetDto) {
    return this.budgetsService.findAll(queryDto);
  }

  @UseGuards(AuthGuard)
  @Get('stats')
  getStats() {
    return this.budgetsService.getStats();
  }

  @UseGuards(AuthGuard)
  @Get('pending')
  getPendingBudgets() {
    return this.budgetsService.getPendingBudgets();
  }

  @UseGuards(AuthGuard)
  @Get('expired')
  getExpiredBudgets() {
    return this.budgetsService.getExpiredBudgets();
  }

  @UseGuards(AuthGuard)
  @Post('resend-emails')
  resendFailedEmails() {
    return this.budgetsService.resendFailedEmails();
  }

  // Endpoint público para consultar presupuesto por número de pedido
  @Get('order/:numeroPedido')
  findByOrderNumber(@Param('numeroPedido') numeroPedido: string) {
    return this.budgetsService.findByOrderNumber(numeroPedido);
  }

  // Endpoint enriquecido para obtener presupuesto por ID con datos de productos
  @UseGuards(AuthGuard)
  @Get(':id/enriched')
  findOneEnriched(@Param('id') id: string) {
    return this.budgetsService.findOneEnriched(id);
  }

  // Endpoint enriquecido para obtener presupuesto por numeroPresupuesto con datos de productos (PÚBLICO)
  @Get('numero/:numeroPresupuesto/enriched')
  findByNumeroPresupuestoEnriched(@Param('numeroPresupuesto') numeroPresupuesto: string) {
    const numero = parseInt(numeroPresupuesto);
    return this.budgetsService.findByNumeroPresupuestoEnriched(numero);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.budgetsService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBudgetDto: UpdateBudgetDto) {
    return this.budgetsService.update(id, updateBudgetDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.budgetsService.remove(id);
  }
}
