import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PropertiesModule } from './properties/properties.module';
import { TenantsModule } from './tenants/tenants.module';
import { RentChargesModule } from './rent-charges/rent-charges.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../../.env',
      isGlobal: true,
    }),
    PrismaModule,
    PropertiesModule,
    TenantsModule,
    RentChargesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
