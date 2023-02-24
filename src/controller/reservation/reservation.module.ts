import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm/dist/typeorm.module";
import { FirebaseProviderModule } from "src/core/provider/firebase/firebase-provider.module";
import { ReservationService } from "src/services/reservation.service";
import { Reservation } from "src/shared/entities/Reservation";
import { ReminderModule } from "../reminder/reminder.module";
import { ReservationController } from "./reservation.controller";

@Module({
  imports: [
    ReminderModule,
    FirebaseProviderModule,
    TypeOrmModule.forFeature([Reservation]),
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
  exports: [ReservationService],
})
export class ReservationModule {}
