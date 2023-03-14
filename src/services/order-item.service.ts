import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityStatusEnum } from 'src/common/enums/entity-status.enum';
import { ReservationStatusEnum } from 'src/common/enums/reservation-status.enum';
import { CreateOrderItemDto } from 'src/core/dto/order-item/order-item.create.dto';
import { AddOrderItemDto, OrderItemDto } from 'src/core/dto/order-item/order-item.update.dto';
import { EntityStatus } from 'src/shared/entities/EntityStatus';
import { OrderItem } from 'src/shared/entities/OrderItem';
import { OrderItemType } from 'src/shared/entities/OrderItemType';
import { Reservation } from 'src/shared/entities/Reservation';
import { Repository } from 'typeorm';

@Injectable()
export class OrderItemService {
    constructor(
      @InjectRepository(OrderItem)
      private readonly orderItemRepo: Repository<OrderItem>
    ) {}
    async findByRervationId(reservationId: string) {
      try {
        return await this.orderItemRepo.find({
          where: {
            reservation: { reservationId },
            entityStatus: { entityStatusId: EntityStatusEnum.ACTIVE.toString() }
          },
          relations: {
            orderItemType: true,
            entityStatus: true,
            reservation: true
          }
        });
      } catch (e) {
        throw e;
      }
    }
  
    async findOne(options?: any) {
      try {
        const orderItem = await this.orderItemRepo.findOne({
          where: options,
          relations: {
            orderItemType: true,
            entityStatus: true,
            reservation: true
          },
        });
        return orderItem;
      } catch (e) {
        console.log(e);
        throw e;
      }
    }
  
    async findById(orderItemId: string) {
      try {
        const orderItem = await this.findOne({
          orderItemId,
          entityStatus: { entityStatusId: EntityStatusEnum.ACTIVE.toString() },
        });
        if (!orderItem) {
          throw new HttpException("Order Item not found", HttpStatus.NOT_FOUND);
        }
        return orderItem;
      } catch (e) {
        throw e;
      }
    }
  
    async add(addOrderItemDto: AddOrderItemDto) {
      const { reservationId, orderItemTypeId, quantity } = addOrderItemDto;
      return await this.orderItemRepo.manager.transaction(
        async (entityManager) => {
          const orderItem = new OrderItem();
          const reservation = await entityManager.findOne(Reservation, {
            where: { 
              reservationId: reservationId
            },
            relations: {
              reservationStatus: true
            }
          });
          if(!reservation) {
            throw new HttpException(
              "Reservations not found",
              HttpStatus.BAD_REQUEST
            );
          }
          if(reservation.reservationStatus.reservationStatusId !== ReservationStatusEnum.PENDING.toString()) {
            throw new HttpException(
              "Only pending reservations are allowed to add items",
              HttpStatus.BAD_REQUEST
            );
          }
          orderItem.orderItemType = await entityManager.findOne(OrderItemType, {
            where: { 
              orderItemTypeId: orderItemTypeId
            }
          });
          if((Number(quantity)) <= 0) {
            throw new HttpException(
              `Invalid quantity ${orderItem.orderItemType.name}!`,
              HttpStatus.BAD_REQUEST
            );
          }
          orderItem.quantity = quantity.toString();
          orderItem.reservation = reservation;
          orderItem.remarks = addOrderItemDto.remarks;
          return await entityManager.save(OrderItem, orderItem);
        }
      );
    }
  
    async update(dto: OrderItemDto) {
      const { orderItemId, reservationId, orderItemTypeId, quantity } = dto;
      return await this.orderItemRepo.manager.transaction(
        async (entityManager) => {
          const orderItem: OrderItem = await entityManager.findOne(OrderItem, {
            where: {
              orderItemId,
              entityStatus: {
                entityStatusId: EntityStatusEnum.ACTIVE.toString()
              }
            },
            relations: {
              orderItemType: true,
              reservation: true
            }
          });
          if (!orderItem) {
            throw new HttpException(
              `Order Item doesn't exist`,
              HttpStatus.NOT_FOUND
            );
          }
          const reservation = await entityManager.findOne(Reservation, {
            where: { 
              reservationId: reservationId
            },
            relations: {
              reservationStatus: true
            }
          });
          if(!reservation) {
            throw new HttpException(
              "Reservations not found",
              HttpStatus.BAD_REQUEST
            );
          }
          if(reservation.reservationStatus.reservationStatusId !== ReservationStatusEnum.PENDING.toString()) {
            throw new HttpException(
              "Only pending reservations are allowed to update items",
              HttpStatus.BAD_REQUEST
            );
          }
          orderItem.quantity = quantity.toString();
          orderItem.reservation = reservation;
          orderItem.orderItemType = await entityManager.findOne(OrderItemType, {
            where: { 
              orderItemTypeId: orderItemTypeId
            }
          });
          orderItem.remarks = dto.remarks;
          return await entityManager.save(OrderItem, orderItem);
        }
      );
    }
  
    async delete(orderItemId: string) {
      try {
        return await this.orderItemRepo.manager.transaction(
          async (entityManager) => {
            const orderItem = await entityManager.findOne(OrderItem, {
              where: { 
                orderItemId,
                entityStatus:  { entityStatusId: EntityStatusEnum.ACTIVE.toString() }
              },
              relations: {
                entityStatus: true
              }
            });
            if (!orderItem) {
              throw new HttpException("Order Item not found", HttpStatus.NOT_FOUND);
            }
            orderItem.entityStatus = await entityManager.findOne(EntityStatus, {
              where: {
                entityStatusId: EntityStatusEnum.DELETED.toString()
              }
            });
            return await this.orderItemRepo.save(orderItem);
          });
      } catch (e) {
        throw e;
      }
    }
  }
  