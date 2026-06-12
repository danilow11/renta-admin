import { Module } from '@nestjs/common';
import { RentChargesController } from './rent-charges.controller';
import { RentChargesService } from './rent-charges.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [RentChargesController],
  providers: [RentChargesService],
})
export class RentChargesModule {}
