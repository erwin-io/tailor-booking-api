import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityStatusEnum } from 'src/common/enums/entity-status.enum';
import { CreateOrderItemTypeDto } from 'src/core/dto/order-item-type/order-item-type.create.dto';
import { OrderItemTypeDto } from 'src/core/dto/order-item-type/order-item-type.update.dto';
import { OrderItemType } from 'src/shared/entities/OrderItemType';
import { Repository } from 'typeorm';

@Injectable()
export class OrderItemTypeService {
    constructor(
      @InjectRepository(OrderItemType)
      private readonly orderItemTypeRepo: Repository<OrderItemType>
    ) {}
    async findAll() {
      try {
        return await this.orderItemTypeRepo.find({
          where: {
            entityStatus: { entityStatusId: EntityStatusEnum.ACTIVE.toString() }
          },
          relations: {
            entityStatus: true
          }
        });
      } catch (e) {
        throw e;
      }
    }
  
    async findOne(options?: any) {
      try {
        const orderItemType = await this.orderItemTypeRepo.findOne({
          where: options,
          relations: {
              entityStatus: true,
          },
        });
        return orderItemType;
      } catch (e) {
        console.log(e);
        throw e;
      }
    }
  
    async findById(orderItemTypeId: string) {
      try {
        const orderItemType = await this.findOne({
          orderItemTypeId,
          entityStatus: { entityStatusId: EntityStatusEnum.ACTIVE.toString() },
        });
        if (!orderItemType) {
          throw new HttpException("OrderItemType not found", HttpStatus.NOT_FOUND);
        }
        return orderItemType;
      } catch (e) {
        throw e;
      }
    }
  
    async add(createOrderItemTypeDto: CreateOrderItemTypeDto) {
      return await this.orderItemTypeRepo.manager.transaction(
        async (entityManager) => {
          const isInDb = await this.findOne({
            name: createOrderItemTypeDto.name,
            entityStatus: { entityStatusId: EntityStatusEnum.ACTIVE.toString() },
          });
          if (isInDb) {
            throw new HttpException(
              "Order Item Type already exist",
              HttpStatus.CONFLICT
            );
          }
          const orderItemType = new OrderItemType();
          orderItemType.name = createOrderItemTypeDto.name;
          return await entityManager.save(OrderItemType, orderItemType);
        }
      );
    }
  
    async update(dto: OrderItemTypeDto) {
      const orderItemTypeId = dto.orderItemTypeId;
      return await this.orderItemTypeRepo.manager.transaction(
        async (entityManager) => {
          const orderItemType: any = await this.findOne({
            orderItemTypeId,
            entityStatus: { entityStatusId: EntityStatusEnum.ACTIVE.toString() },
          });
          if (!orderItemType) {
            throw new HttpException(
              `Order Item Type doesn't exist`,
              HttpStatus.NOT_FOUND
            );
          }
          const isInDb = await this.findOne({
            name: dto.name,
            entityStatus: { entityStatusId: EntityStatusEnum.ACTIVE.toString() },
          });
          if (isInDb && isInDb.orderItemTypeId != orderItemTypeId) {
            throw new HttpException(
              "Order Item Type already exist",
              HttpStatus.CONFLICT
            );
          }
          orderItemType.name = dto.name;
          return await entityManager.save(OrderItemType, orderItemType);
        }
      );
    }
  
    async delete(orderItemTypeId: string) {
      try {
        const orderItemType = await this.findOne({
          orderItemTypeId,
          entityStatus: { entityStatusId: EntityStatusEnum.ACTIVE.toString() },
        });
        if (!orderItemType) {
          throw new HttpException("Order Item Type not found", HttpStatus.NOT_FOUND);
        }
        orderItemType.entityStatus.entityStatusId = EntityStatusEnum.DELETED.toString();
        return await this.orderItemTypeRepo.save(orderItemType);
      } catch (e) {
        throw e;
      }
    }
  }
  