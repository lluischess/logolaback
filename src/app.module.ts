import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { BudgetsModule } from './budgets/budgets.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    ProductsModule,
    CategoriesModule,
    BudgetsModule,
    ConfigurationModule,
    EmailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
