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
import { OrderItemTypeService } from './services/order-item-type.service';
import { OrderItemTypeModule } from './controller/order-item-type/order-item-type.module';
import { OrderItemModule } from './controller/order-item/order-item.module';
import { OrderItemService } from './services/order-item.service';
import { PaymentsModule } from "./controller/payments/payments.module";
import { ActivityLogService } from './services/activity-log.service';
import { ActivityLogController } from './controller/activity-log/activity-log.controller';
import { ActivityLogModule } from './controller/activity-log/activity-log.module';
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
    OrderItemTypeModule,
    OrderItemModule,
    PaymentsModule,
    ActivityLogModule
  ],
  providers: [AppService],
  controllers: [],
})
export class AppModule {}
