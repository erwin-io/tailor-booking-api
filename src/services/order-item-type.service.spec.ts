import { Test, TestingModule } from '@nestjs/testing';
import { OrderItemTypeService } from './order-item-type.service';

describe('OrderItemTypeService', () => {
  let service: OrderItemTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderItemTypeService],
    }).compile();

    service = module.get<OrderItemTypeService>(OrderItemTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
