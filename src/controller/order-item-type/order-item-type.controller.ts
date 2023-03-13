import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomResponse } from 'src/common/helper/customresponse.helpers';
import { JwtAuthGuard } from 'src/core/auth/jwt.auth.guard';
import { CreateOrderItemTypeDto } from 'src/core/dto/order-item-type/order-item-type.create.dto';
import { OrderItemTypeDto } from 'src/core/dto/order-item-type/order-item-type.update.dto';
import { OrderItemTypeService } from 'src/services/order-item-type.service';

@ApiTags("order-item-type")
@Controller('order-item-type')
@ApiBearerAuth("jwt")
export class OrderItemTypeController {
    constructor(
      private readonly orderItemTypeService: OrderItemTypeService
    ) {}
  
    @Get("")
    @UseGuards(JwtAuthGuard)
    async getAll() {
      const res: CustomResponse = {};
      try {
        res.data = await this.orderItemTypeService.findAll();
        res.success = true;
        return res;
      } catch (e) {
        res.success = false;
        res.message = e.message !== undefined ? e.message : e;
        return res;
      }
    }
  
    @Get(":orderItemTypeId")
    @UseGuards(JwtAuthGuard)
    async findOne(@Param("orderItemTypeId") orderItemTypeId: string) {
      const res: CustomResponse = {};
      try {
        res.data = await this.orderItemTypeService.findById(
          orderItemTypeId
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
    async create(@Body() createOrderItemTypeDto: CreateOrderItemTypeDto) {
      const res: CustomResponse = {};
      try {
        res.data = await this.orderItemTypeService.add(
          createOrderItemTypeDto
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
    async update(@Body() orderItemTypeDto: OrderItemTypeDto) {
      const res: CustomResponse = {};
      try {
        res.data = await this.orderItemTypeService.update(orderItemTypeDto);
        res.success = true;
        return res;
      } catch (e) {
        res.success = false;
        res.message = e.message !== undefined ? e.message : e;
        return res;
      }
    }
  
    @Delete(":orderItemTypeId")
    async delete(@Param("orderItemTypeId") orderItemTypeId: string) {
      const res: CustomResponse = {};
      try {
        const res: CustomResponse = {};
        res.data = await this.orderItemTypeService.delete(orderItemTypeId);
        res.success = true;
        return res;
      } catch (e) {
        res.success = false;
        res.message = e.message !== undefined ? e.message : e;
        return res;
      }
    }
  }
  