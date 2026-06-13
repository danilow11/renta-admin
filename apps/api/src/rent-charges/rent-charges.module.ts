import { Module } from '@nestjs/common';
import { RentChargesController } from './rent-charges.controller';
import { RentChargesService } from './rent-charges.service';
import { AuthModule } from '../auth/auth.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [AuthModule, WorkspacesModule],
  controllers: [RentChargesController],
  providers: [RentChargesService],
})
export class RentChargesModule {}
