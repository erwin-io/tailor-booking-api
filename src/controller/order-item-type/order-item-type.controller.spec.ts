import { Test, TestingModule } from '@nestjs/testing';
import { OrderItemTypeController } from './order-item-type.controller';

describe('OrderItemTypeController', () => {
  let controller: OrderItemTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderItemTypeController],
    }).compile();

    controller = module.get<OrderItemTypeController>(OrderItemTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
