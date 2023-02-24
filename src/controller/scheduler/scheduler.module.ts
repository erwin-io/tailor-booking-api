import { Module } from "@nestjs/common";
import { FirebaseProviderModule } from "src/core/provider/firebase/firebase-provider.module";
import { SchedulerService } from "src/services/scheduler.service";
import { NotificationModule } from "../notification/notification.module";
import { ReminderModule } from "../reminder/reminder.module";
import { SchedulerController } from "./scheduler.controller";

@Module({
  imports: [NotificationModule, ReminderModule, FirebaseProviderModule],
  controllers: [SchedulerController],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
