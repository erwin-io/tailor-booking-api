import { Module } from '@nestjs/common';
import { ActivityType } from 'src/shared/entities/ActivityType';
import { ActivityLogController } from './activity-log.controller';
import { ActivityLogService } from 'src/services/activity-log.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ActivityLog } from 'src/shared/entities/ActivityLog';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
      UsersModule,
      TypeOrmModule.forFeature([ActivityLog]),
    ],
    controllers: [ActivityLogController],
    providers: [ActivityLogService],
    exports: [ActivityLogService],
})
export class ActivityLogModule {}
