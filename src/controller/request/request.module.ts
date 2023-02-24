import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FirebaseProviderModule } from "src/core/provider/firebase/firebase-provider.module";
import { RequestService } from "src/services/request.service";
import { ReminderModule } from "../reminder/reminder.module";
import { RequestController } from "./request.controller";

@Module({
  imports: [
    ReminderModule,
    FirebaseProviderModule,
    TypeOrmModule.forFeature([Request]),
  ],
  controllers: [RequestController],
  providers: [RequestService],
  exports: [RequestService],
})
export class RequestModule {}
