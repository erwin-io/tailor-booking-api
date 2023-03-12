import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DashboardService } from "src/services/dashboard.service";
import { Reservation } from "src/shared/entities/Reservation";
import { DashboardController } from "./dashboard.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
