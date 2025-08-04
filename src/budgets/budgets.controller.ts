import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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

  // Endpoint público para subir logotipo de empresa
  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('logo', {
    storage: diskStorage({
      destination: './uploads/logos',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        cb(null, `logo-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      console.log('🔍 [BUDGETS-CONTROLLER] Validando archivo:', file.mimetype);
      
      // Lista más amplia de tipos MIME permitidos
      const allowedMimes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/svg+xml',
        'image/webp'
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        console.log('✅ [BUDGETS-CONTROLLER] Tipo de archivo válido:', file.mimetype);
        cb(null, true);
      } else {
        console.error('❌ [BUDGETS-CONTROLLER] Tipo de archivo no válido:', file.mimetype);
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten: ${allowedMimes.join(', ')}`), false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB máximo para logos (aumentado)
    },
  }))
  async uploadLogo(@UploadedFile() file: any) {
    try {
      console.log('📤 [BUDGETS-CONTROLLER] === SUBIENDO LOGOTIPO ===');
      console.log('📤 [BUDGETS-CONTROLLER] Archivo recibido:', file ? 'SÍ' : 'NO');
      
      if (!file) {
        console.error('❌ [BUDGETS-CONTROLLER] No se proporcionó ningún archivo');
        throw new BadRequestException('No se proporcionó ningún archivo');
      }

      console.log('📤 [BUDGETS-CONTROLLER] Detalles del archivo:');
      console.log('📤 [BUDGETS-CONTROLLER] - Nombre original:', file.originalname);
      console.log('📤 [BUDGETS-CONTROLLER] - Nombre del archivo:', file.filename);
      console.log('📤 [BUDGETS-CONTROLLER] - Tamaño:', file.size, 'bytes');
      console.log('📤 [BUDGETS-CONTROLLER] - Tipo MIME:', file.mimetype);
      console.log('📤 [BUDGETS-CONTROLLER] - Ruta:', file.path);

      // Devolver la ruta relativa del logo
      const imagePath = `/uploads/logos/${file.filename}`;
      console.log('✅ [BUDGETS-CONTROLLER] Logotipo subido exitosamente:', imagePath);
      
      return { imagePath };
      
    } catch (error) {
      console.error('❌ [BUDGETS-CONTROLLER] Error en upload-logo:', error);
      throw error;
    }
  }

  // Endpoint alternativo para logotipo como base64 (sin subida de archivos)
  @Post('upload-logo-base64')
  async uploadLogoBase64(@Body() body: { logoData: string; fileName: string }) {
    try {
      console.log('📤 [BUDGETS-CONTROLLER] === SUBIENDO LOGOTIPO BASE64 ===');
      console.log('📤 [BUDGETS-CONTROLLER] Archivo recibido:', body.fileName);
      console.log('📤 [BUDGETS-CONTROLLER] Tamaño de datos:', body.logoData ? body.logoData.length : 0, 'caracteres');
      
      if (!body.logoData || !body.fileName) {
        throw new BadRequestException('Se requieren logoData y fileName');
      }

      // Simular ruta de logotipo (en este caso, guardaremos el base64 directamente en el presupuesto)
      const logoReference = `base64-logo-${Date.now()}`;
      console.log('✅ [BUDGETS-CONTROLLER] Logotipo base64 procesado:', logoReference);
      
      return { 
        imagePath: logoReference,
        logoData: body.logoData // Devolver los datos para guardar en el presupuesto
      };
      
    } catch (error) {
      console.error('❌ [BUDGETS-CONTROLLER] Error en upload-logo-base64:', error);
      throw error;
    }
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
