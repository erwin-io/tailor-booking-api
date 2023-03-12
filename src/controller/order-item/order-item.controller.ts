import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomResponse } from 'src/common/helper/customresponse.helpers';
import { JwtAuthGuard } from 'src/core/auth/jwt.auth.guard';
import { CreateOrderItemDto } from 'src/core/dto/order-item/order-item.create.dto';
import { AddOrderItemDto, OrderItemDto } from 'src/core/dto/order-item/order-item.update.dto';
import { OrderItemService } from 'src/services/order-item.service';

@ApiTags("order-item")
@Controller('order-item')
@ApiBearerAuth("jwt")
export class OrderItemController {
    constructor(
      private readonly orderItemService: OrderItemService
    ) {}
  
    @Get("getByReservationId/:reservationId")
    @UseGuards(JwtAuthGuard)
    async getByReservationId(@Param("reservationId") reservationId: string) {
      const res: CustomResponse = {};
      try {
        res.data = await this.orderItemService.findByRervationId(reservationId);
        res.success = true;
        return res;
      } catch (e) {
        res.success = false;
        res.message = e.message !== undefined ? e.message : e;
        return res;
      }
    }
  
    @Get(":orderItemId")
    @UseGuards(JwtAuthGuard)
    async findOne(@Param("orderItemId") orderItemId: string) {
      const res: CustomResponse = {};
      try {
        res.data = await this.orderItemService.findById(
          orderItemId
        );
        res.success = true;
        return res;
      } catch (e) {
        res.success = false;
        res.message = e.message !== undefined ? e.message : e;
        return res;
      }
    }
  
    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() addOrderItemDto: AddOrderItemDto) {
      const res: CustomResponse = {};
      try {
        res.data = await this.orderItemService.add(
            addOrderItemDto
        );
        res.success = true;
        return res;
      } catch (e) {
        res.success = false;
        res.message = e.message !== undefined ? e.message : e;
        return res;
      }
    }
  
    @Put()
    @UseGuards(JwtAuthGuard)
    async update(@Body() orderItemDto: OrderItemDto) {
      const res: CustomResponse = {};
      try {
        res.data = await this.orderItemService.update(orderItemDto);
        res.success = true;
        return res;
      } catch (e) {
        res.success = false;
        res.message = e.message !== undefined ? e.message : e;
        return res;
      }
    }
  
    @Delete(":orderItemId")
    async delete(@Param("orderItemId") orderItemId: string) {
      const res: CustomResponse = {};
      try {
        const res: CustomResponse = {};
        res.data = await this.orderItemService.delete(orderItemId);
        res.success = true;
        return res;
      } catch (e) {
        res.success = false;
        res.message = e.message !== undefined ? e.message : e;
        return res;
      }
    }
  }
  