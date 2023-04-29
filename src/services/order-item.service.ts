import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { extname } from 'path';
import { EntityStatusEnum } from 'src/common/enums/entity-status.enum';
import { ReservationStatusEnum } from 'src/common/enums/reservation-status.enum';
import { CreateOrderItemDto } from 'src/core/dto/order-item/order-item.create.dto';
import { AddOrderItemDto, OrderItemAttachmentDto, OrderItemDto } from 'src/core/dto/order-item/order-item.update.dto';
import { EntityStatus } from 'src/shared/entities/EntityStatus';
import { Files } from 'src/shared/entities/Files';
import { OrderItem } from 'src/shared/entities/OrderItem';
import { OrderItemAttachment } from 'src/shared/entities/OrderItemAttachment';
import { OrderItemType } from 'src/shared/entities/OrderItemType';
import { Reservation } from 'src/shared/entities/Reservation';
import { Repository } from 'typeorm';
import { FirebaseProvider } from "src/core/provider/firebase/firebase-provider";
import { v4 as uuid } from "uuid";

@Injectable()
export class OrderItemService {
    constructor(
      @InjectRepository(OrderItem)
      private readonly orderItemRepo: Repository<OrderItem>,
      private firebaseProvoder: FirebaseProvider
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

    async addAttachmentFile(dto: OrderItemAttachmentDto) {
      try {
        return await this.orderItemRepo.manager.transaction( async(entityManager)=> {
          if(dto.data) {
            let orderItemAttachment = new OrderItemAttachment();
            const newFileName: string = uuid();
            const bucket = this.firebaseProvoder.app.storage().bucket();
  
            const file = new Files();
            file.fileName = `${newFileName}${extname(dto.fileName)}`;
  
            const bucketFile = bucket.file(
              `items/attachments/${newFileName}${extname(
                dto.fileName
              )}`
            );
            const img = Buffer.from(dto.data, "base64");
            await bucketFile.save(img).then(async () => {
              const url = await bucketFile.getSignedUrl({
                action: "read",
                expires: "03-09-2500",
              });
              file.url = url[0];
              orderItemAttachment.file = await entityManager.save(
                Files,
                file
              );
            });
            orderItemAttachment.orderItem = await entityManager.findOneBy(OrderItem, { orderItemId: dto.orderItemId });
            await entityManager.save(
              OrderItemAttachment,
              orderItemAttachment
            );
            return entityManager.find(OrderItemAttachment, { 
              where: { 
                orderItem: { orderItemId : dto.orderItemId }
              },
              relations: ["file"]
            });
          } else {
            return [];
          }
        })
      } catch (e) {
        throw e;
      }
    }

    async removeAttachmentFile(orderItemAttachmentId: string) {
      try {
        return await this.orderItemRepo.manager.transaction( async(entityManager)=> {
          const orderItemAttachment = await entityManager.findOne(OrderItemAttachment, 
            { where: { orderItemAttachmentId}, relations: ["file", "appointment"] }, 
          );
          if(orderItemAttachment) {
            await entityManager.delete(OrderItemAttachment, { orderItemAttachmentId });
            const file = orderItemAttachment.file;
            await entityManager.delete(Files, { fileId: file.fileId });
            
            try {
              const bucket = this.firebaseProvoder.app.storage().bucket();
              const deleteFile = bucket.file(
                `items/attachments/${orderItemAttachment.file.fileName}`
              );
              deleteFile.delete();
            } catch (ex) {
              console.log(ex);
            }
  
            const orderItem = orderItemAttachment.orderItem;
            return entityManager.find(OrderItemAttachment, { 
              where: { 
                orderItem: { orderItemId: orderItem.orderItemId }
              },
              relations: ["file"]
            });
          } else {
            return [];
          }
        })
      } catch (e) {
        throw e;
      }
    }
  }
  