import { UsersController } from "./users.controller";
import { Module } from "@nestjs/common";
import { UsersService } from "../../services/users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "../../shared/entities/Users";
import { FirebaseProviderModule } from "src/core/provider/firebase/firebase-provider.module";
import { OtpService } from "src/services/otp.service";
import { HttpModule } from "@nestjs/axios";
@Module({
  imports: [HttpModule, FirebaseProviderModule, TypeOrmModule.forFeature([Users])],
  controllers: [UsersController],
  providers: [UsersService, OtpService],
  exports: [UsersService],
})
export class UsersModule {}
