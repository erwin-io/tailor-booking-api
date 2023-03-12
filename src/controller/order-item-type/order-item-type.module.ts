import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemTypeService } from 'src/services/order-item-type.service';
import { OrderItemType } from 'src/shared/entities/OrderItemType';
import { OrderItemTypeController } from './order-item-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItemType])],
  controllers: [OrderItemTypeController],
  providers: [OrderItemTypeService],
  exports: [OrderItemTypeService],
})
export class OrderItemTypeModule {}
