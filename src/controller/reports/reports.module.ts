import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReportsService } from "src/services/reports.service";
import { Payment } from "src/shared/entities/Payment";
import { ReportsController } from "./reports.controller";
import { Reservation } from "src/shared/entities/Reservation";

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Reservation, Payment]),
  ],
    controllers: [ReportsController],
    providers: [ReportsService],
    exports: [ReportsService],
})
export class ReportsModule {}
