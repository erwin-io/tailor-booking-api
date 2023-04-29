import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemService } from 'src/services/order-item.service';
import { OrderItem } from 'src/shared/entities/OrderItem';
import { OrderItemController } from './order-item.controller';
import { FirebaseProviderModule } from 'src/core/provider/firebase/firebase-provider.module';

@Module({
  imports: [
    FirebaseProviderModule,TypeOrmModule.forFeature([OrderItem])],
  controllers: [OrderItemController],
  providers: [OrderItemService],
  exports: [OrderItemService],
})
export class OrderItemModule {}
