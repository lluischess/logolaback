import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Budget, BudgetDocument } from './schemas/budget.schema';
import { CreateBudgetDto, UpdateBudgetDto, QueryBudgetDto } from './dto';
import { BudgetStatus } from './interfaces/budget.interface';
// Importar modelo de productos para hacer JOIN
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { EmailService } from '../email/email.service';
import { ConfigurationService } from '../configuration/configuration.service';

@Injectable()
export class BudgetsService {
  private readonly logger = new Logger(BudgetsService.name);

  constructor(
    @InjectModel(Budget.name) private budgetModel: Model<BudgetDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private emailService: EmailService,
    private configurationService: ConfigurationService,
  ) {}

  async create(createBudgetDto: CreateBudgetDto): Promise<Budget> {
    try {
      // Calcular precio total si no se proporciona
      if (!createBudgetDto.precioTotal && createBudgetDto.productos.length > 0) {
        createBudgetDto.precioTotal = createBudgetDto.productos.reduce((total, producto) => {
          return total + (producto.subtotal || 0);
        }, 0);
      }

      const createdBudget = new this.budgetModel(createBudgetDto);
      const savedBudget = await createdBudget.save();

      // Enviar emails automáticos
      await this.sendAutomaticEmails(savedBudget);

      this.logger.log(`Presupuesto creado: ${savedBudget.numeroPedido}`);
      return savedBudget;
    } catch (error) {
      this.logger.error(`Error creando presupuesto: ${error.message}`);
      throw error;
    }
  }

  async findAll(queryDto: QueryBudgetDto = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'numeroPresupuesto',
      sortOrder = 'desc',
      search,
      estado,
      clienteEmail,
      fechaDesde,
      fechaHasta,
      vencidos
    } = queryDto;

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    // Construir filtros
    const filters: any = {};
    
    if (search) {
      filters.$or = [
        { numeroPedido: { $regex: search, $options: 'i' } },
        { 'cliente.nombre': { $regex: search, $options: 'i' } },
        { 'cliente.email': { $regex: search, $options: 'i' } },
        { 'cliente.empresa': { $regex: search, $options: 'i' } },
        { 'productos.nombre': { $regex: search, $options: 'i' } },
        { 'productos.referencia': { $regex: search, $options: 'i' } }
      ];
    }

    if (estado) {
      filters.estado = estado;
    }

    if (clienteEmail) {
      filters['cliente.email'] = clienteEmail;
    }

    if (fechaDesde || fechaHasta) {
      filters.createdAt = {};
      if (fechaDesde) {
        filters.createdAt.$gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        filters.createdAt.$lte = new Date(fechaHasta);
      }
    }

    if (vencidos) {
      filters.fechaVencimiento = { $lt: new Date() };
      filters.estado = { $nin: [BudgetStatus.COMPLETADO, BudgetStatus.CANCELADO] };
    }

    const [budgets, total] = await Promise.all([
      this.budgetModel
        .find(filters)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.budgetModel.countDocuments(filters)
    ]);

    return {
      budgets,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    };
  }

  async findOne(id: string): Promise<Budget> {
    const budget = await this.budgetModel.findById(id).exec();
    if (!budget) {
      throw new NotFoundException(`Presupuesto con ID ${id} no encontrado`);
    }
    return budget;
  }

  async findByOrderNumber(numeroPedido: string): Promise<Budget> {
    const budget = await this.budgetModel.findOne({ numeroPedido }).exec();
    if (!budget) {
      throw new NotFoundException(`Presupuesto con número ${numeroPedido} no encontrado`);
    }
    return budget;
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto): Promise<Budget> {
    try {
      const existingBudget = await this.budgetModel.findById(id);
      if (!existingBudget) {
        throw new NotFoundException(`Presupuesto con ID ${id} no encontrado`);
      }

      // Si se cambia el estado, actualizar historial
      if (updateBudgetDto.estado && updateBudgetDto.estado !== existingBudget.estado) {
        const newHistoryEntry = {
          estado: updateBudgetDto.estado,
          fecha: new Date(),
          notas: updateBudgetDto.notasEstado || `Estado cambiado a ${updateBudgetDto.estado}`
        };

        updateBudgetDto['$push'] = {
          historialEstados: newHistoryEntry
        };

        // Enviar email de notificación al cliente si es necesario
        await this.sendStatusChangeEmail(existingBudget, updateBudgetDto.estado);
      }

      const updatedBudget = await this.budgetModel
        .findByIdAndUpdate(id, updateBudgetDto, { new: true })
        .exec();
      
      this.logger.log(`Presupuesto actualizado: ${updatedBudget.numeroPedido}`);
      return updatedBudget;
    } catch (error) {
      this.logger.error(`Error actualizando presupuesto: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const deletedBudget = await this.budgetModel.findByIdAndDelete(id).exec();
    if (!deletedBudget) {
      throw new NotFoundException(`Presupuesto con ID ${id} no encontrado`);
    }
    
    this.logger.log(`Presupuesto eliminado: ${deletedBudget.numeroPedido}`);
    return { message: `Presupuesto ${deletedBudget.numeroPedido} eliminado correctamente` };
  }

  async getStats() {
    const [total, byStatus, vencidos, sinNotificar] = await Promise.all([
      this.budgetModel.countDocuments(),
      this.budgetModel.aggregate([
        { $group: { _id: '$estado', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      this.budgetModel.countDocuments({
        fechaVencimiento: { $lt: new Date() },
        estado: { $nin: [BudgetStatus.COMPLETADO, BudgetStatus.CANCELADO] }
      }),
      this.budgetModel.countDocuments({
        'notificacionesEmail.admin.enviado': false
      })
    ]);

    const statusStats = {};
    byStatus.forEach(item => {
      statusStats[item._id] = item.count;
    });

    return {
      total,
      byStatus: statusStats,
      vencidos,
      sinNotificarAdmin: sinNotificar
    };
  }

  async getPendingBudgets(): Promise<Budget[]> {
    return this.budgetModel
      .find({ estado: BudgetStatus.PENDIENTE })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getExpiredBudgets(): Promise<Budget[]> {
    return this.budgetModel
      .find({
        fechaVencimiento: { $lt: new Date() },
        estado: { $nin: [BudgetStatus.COMPLETADO, BudgetStatus.CANCELADO] }
      })
      .sort({ fechaVencimiento: 1 })
      .exec();
  }

  // Método para reenviar emails fallidos (usando EmailService)
  async resendFailedEmails(): Promise<{ message: string, processed: number }> {
    const failedBudgets = await this.budgetModel.find({
      estado: 'pendiente'
    });

    let processed = 0;
    for (const budget of failedBudgets) {
      try {
        await this.sendAutomaticEmails(budget);
        processed++;
      } catch (error) {
        this.logger.error(`Error reenviando emails para presupuesto ${budget.numeroPedido}: ${error.message}`);
      }
    }

    return {
      message: `Se procesaron ${processed} presupuestos con emails fallidos`,
      processed
    };
  }

  /**
   * Enriquecer presupuestos con datos de productos (JOIN)
   * Combina la referencia del producto con sus datos actuales
   */
  async enrichBudgetWithProducts(budget: any): Promise<any> {
    try {
      const enrichedProducts = [];
      
      for (const budgetProduct of budget.productos) {
        // Buscar el producto real en la tabla productos
        const productId = budgetProduct.productId;
        this.logger.log(`🔍 Buscando producto con ID: ${productId}`);
        this.logger.log(`🔍 Tipo de productId: ${typeof productId}`);
        
        let product = null;
        try {
          // Usar consulta directa con MongoDB para asegurar que obtenemos todos los campos
          const { ObjectId } = require('mongoose').Types;
          if (ObjectId.isValid(productId)) {
            // Usar findOne con select explícito para asegurar que obtenemos todos los campos
            product = await this.productModel.findOne({ _id: new ObjectId(productId) })
              .select('nombre categoria descripcion imagenes precio numeroProducto referencia')
              .lean()
              .exec();
            
            this.logger.log(`🔍 Producto encontrado: ${product ? 'SÍ' : 'NO'}`);
            if (product) {
              this.logger.log(`🔍 Nombre del producto: "${product.nombre}"`);
              this.logger.log(`🔍 Categoría: "${product.categoria}"`);
            }
          }
        } catch (error) {
          this.logger.error(`❌ Error buscando producto ${productId}:`, error.message);
        }
        
        if (product && product.nombre) {
          this.logger.log(`✅ Producto encontrado: ${product.nombre}`);
          // Combinar datos: referencia del presupuesto + datos actuales del producto
          enrichedProducts.push({
            // Datos específicos del presupuesto (editables)
            productoId: productId,
            cantidad: budgetProduct.cantidad,
            precioUnitario: budgetProduct.precioUnitario,
            precioTotal: budgetProduct.cantidad * budgetProduct.precioUnitario,
            
            // Datos actuales del producto (de la tabla productos)
            nombre: product.nombre,
            categoria: product.categoria,
            imagen: product.imagenes?.[0] || '/assets/images/producto-placeholder.jpg',
            descripcion: product.descripcion,
            // Nota: NO usamos product.precio, usamos budgetProduct.precioUnitario
          });
        } else {
          // Producto no encontrado - mantener datos básicos
          this.logger.warn(`❌ Producto no encontrado o sin nombre: ${productId}`);
          enrichedProducts.push({
            productoId: productId,
            cantidad: budgetProduct.cantidad,
            precioUnitario: budgetProduct.precioUnitario,
            precioTotal: budgetProduct.cantidad * budgetProduct.precioUnitario,
            nombre: 'Producto no encontrado',
            categoria: 'Sin categoría',
            imagen: '/assets/images/producto-placeholder.jpg'
          });
        }
      }
      
      this.logger.log(`🎯 Productos enriquecidos: ${enrichedProducts.length}`);
      
      // Retornar presupuesto con productos enriquecidos
      return {
        ...budget.toObject(),
        productos: enrichedProducts
      };
      
    } catch (error) {
      this.logger.error(`Error enriqueciendo presupuesto con productos: ${error.message}`);
      return budget;
    }
  }

  /**
   * Obtener presupuesto por ID con productos enriquecidos
   */
  async findOneEnriched(id: string): Promise<any> {
    const budget = await this.budgetModel.findById(id).exec();
    if (!budget) {
      throw new NotFoundException(`Presupuesto con ID ${id} no encontrado`);
    }
    
    return this.enrichBudgetWithProducts(budget);
  }

  /**
   * Obtener presupuesto por numeroPresupuesto con productos enriquecidos
   */
  async findByNumeroPresupuestoEnriched(numeroPresupuesto: number): Promise<any> {
    const budget = await this.budgetModel.findOne({ numeroPresupuesto }).exec();
    if (!budget) {
      throw new NotFoundException(`Presupuesto #${numeroPresupuesto} no encontrado`);
    }
    
    return this.enrichBudgetWithProducts(budget);
  }

  /**
   * Enviar emails automáticos cuando se crea un presupuesto
   */
  private async sendAutomaticEmails(budget: Budget): Promise<void> {
    try {
      // Solo enviar emails si el estado es 'pendiente'
      if (budget.estado !== 'pendiente') {
        this.logger.log(`📧 No se envían emails - Estado: ${budget.estado}`);
        return;
      }

      this.logger.log(`📧 === ENVIANDO EMAILS AUTOMÁTICOS PARA PRESUPUESTO #${budget.numeroPresupuesto} ===`);

      // Obtener email de administración desde configuración
      const generalConfig = await this.configurationService.getGeneralConfig();
      const emailAdministracion = generalConfig?.datos?.emailAdministracion || 'admin@logolate.com';

      this.logger.log(`📧 Email de administración: ${emailAdministracion}`);

      // Preparar datos para el servicio de email
      const budgetDoc = budget as any; // Cast para acceder a propiedades de Mongoose
      const emailData = {
        presupuesto: {
          id: budgetDoc._id.toString(),
          numeroPresupuesto: budget.numeroPresupuesto.toString(),
          fechaCreacion: budgetDoc.createdAt || budgetDoc.fechaCreacion,
          estado: budget.estado,
          total: budget.precioTotal || 0,
          cliente: {
            nombre: budget.cliente.nombre,
            email: budget.cliente.email,
            telefono: budget.cliente.telefono,
            empresa: budget.cliente.empresa
          },
          observaciones: budget.observaciones || '',
          productos: await Promise.all(budget.productos.map(async (p) => {
            // Buscar el producto real para obtener la referencia
            try {
              const product = await this.productModel.findById(p.productId);
              return {
                nombre: product?.referencia || p.productId, // Usar referencia del producto
                cantidad: p.cantidad,
                precio: p.precioUnitario || 0,
                subtotal: p.cantidad * (p.precioUnitario || 0)
              };
            } catch (error) {
              return {
                nombre: p.productId, // Fallback al ID si no se encuentra
                cantidad: p.cantidad,
                precio: p.precioUnitario || 0,
                subtotal: p.cantidad * (p.precioUnitario || 0)
              };
            }
          }))
        },
        emailAdministracion: emailAdministracion
      };

      // Enviar emails usando el servicio de email
      const results = await this.emailService.sendNewPresupuestoEmails(emailData);
      
      this.logger.log(`✅ Emails enviados exitosamente:`, results);

    } catch (error) {
      this.logger.error(`❌ Error enviando emails automáticos:`, error);
      // No lanzar error para no afectar la creación del presupuesto
    }
  }

  /**
   * Enviar email de cambio de estado (opcional)
   */
  private async sendStatusChangeEmail(budget: Budget, newStatus: string): Promise<void> {
    try {
      // Implementar lógica de notificación de cambio de estado si es necesario
      this.logger.log(`📧 Cambio de estado de ${budget.estado} a ${newStatus} para presupuesto #${budget.numeroPresupuesto}`);
    } catch (error) {
      this.logger.error(`❌ Error enviando email de cambio de estado:`, error);
    }
  }
}
