import { Module } from "@nestjs/common";
import { AppService } from "./app.service";
import { UsersModule } from "./controller/users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmConfigService } from "./shared/typeorm/typeorm.service";
import { getEnvPath } from "./common/helper/env.helper";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./controller/auth/auth.module";
import { RolesModule } from "./controller/roles/roles.module";
import { FileModule } from "./controller/file/file.module";
import { DashboardModule } from "./controller/dashboard/dashboard.module";
import { FirebaseProviderModule } from "./core/provider/firebase/firebase-provider.module";
import * as Joi from "@hapi/joi";
import { ReservationModule } from "./controller/reservation/reservation.module";
import { RequestModule } from "./controller/request/request.module";
const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath,
      isGlobal: true,
      validationSchema: Joi.object({
        UPLOADED_FILES_DESTINATION: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    AuthModule,
    UsersModule,
    ReservationModule,
    RolesModule,
    FileModule,
    DashboardModule,
    FirebaseProviderModule,
    ReservationModule,
    RequestModule,
  ],
  providers: [AppService],
  controllers: [],
})
export class AppModule {}
