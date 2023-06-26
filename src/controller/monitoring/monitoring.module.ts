import { Module } from "@nestjs/common";
import { MonitoringController } from "./monitoring.controller";
import { MonitoringService } from "src/services/monitoring.service";
import { Reservation } from "src/shared/entities/Reservation";
import { Payment } from "src/shared/entities/Payment";
import { Users } from "src/shared/entities/Users";
import { TypeOrmModule } from "@nestjs/typeorm/dist/typeorm.module";

@Module({
  controllers: [MonitoringController],
})
@Module({
  imports: [TypeOrmModule.forFeature([Reservation, Payment, Users])],
  controllers: [MonitoringController],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
