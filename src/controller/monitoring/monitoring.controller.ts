/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { CustomResponse } from "src/common/helper/customresponse.helpers";
import { JwtAuthGuard } from "src/core/auth/jwt.auth.guard";
import { MonitoringService } from "src/services/monitoring.service";

@ApiTags("monitoring")
@Controller("monitoring")
@ApiBearerAuth("jwt")
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get("getTotalCustomers")
//   @UseGuards(JwtAuthGuard)
  async getTotalCustomers() {
    const res: CustomResponse = {};
    try {
      res.data = await this.monitoringService.getTotalCustomers();
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Get("getTotalCorporatePeople")
  @UseGuards(JwtAuthGuard)
  async getTotalCorporatePeople() {
    const res: CustomResponse = {};
    try {
      res.data = await this.monitoringService.getTotalCorporatePeople();
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }
  
  @Get("getTotalSales")
  @ApiQuery({ name: "dateFrom", required: false })
  @ApiQuery({ name: "dateTo", required: false })
  @ApiQuery({ name: "assignedUserId", required: false })
  @UseGuards(JwtAuthGuard)
  async getTotalSales(
    @Query("dateFrom") dateFrom = new Date(),
    @Query("dateTo") dateTo = new Date(),
    @Query("assignedUserId") assignedUserId: string = ""
  ) {
    const res: CustomResponse = {};
    try {
      res.data = await this.monitoringService.getTotalSales(
        dateFrom && dateFrom !== undefined && new Date(dateFrom) instanceof Date
          ? new Date(dateFrom)
          : new Date(),
        dateTo && dateTo !== undefined && new Date(dateTo) instanceof Date
          ? new Date(dateTo)
          : new Date(),
        assignedUserId
      );
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }
  
  @Get("getTotalClosedBooking")
  @ApiQuery({ name: "dateFrom", required: false })
  @ApiQuery({ name: "dateTo", required: false })
  @ApiQuery({ name: "assignedUserId", required: false })
  @UseGuards(JwtAuthGuard)
  async getTotalClosedBooking(
    @Query("dateFrom") dateFrom = new Date(),
    @Query("dateTo") dateTo = new Date(),
    @Query("assignedUserId") assignedUserId: string = ""
  ) {
    const res: CustomResponse = {};
    try {
      res.data = await this.monitoringService.getTotalClosedBooking(
        dateFrom && dateFrom !== undefined && new Date(dateFrom) instanceof Date
          ? new Date(dateFrom)
          : new Date(),
        dateTo && dateTo !== undefined && new Date(dateTo) instanceof Date
          ? new Date(dateTo)
          : new Date(),
        assignedUserId
      );
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }
  
  @Get("getReservationMonitoring")
  @ApiQuery({ name: "dateFrom", required: false })
  @ApiQuery({ name: "dateTo", required: false })
  @ApiQuery({ name: "assignedUserId", required: false })
  @UseGuards(JwtAuthGuard)
  async getReservationMonitoring(
    @Query("dateFrom") dateFrom = new Date(),
    @Query("dateTo") dateTo = new Date(),
    @Query("assignedUserId") assignedUserId: string = ""
  ) {
    const res: CustomResponse = {};
    try {
      res.data = await this.monitoringService.getReservationMonitoring(
        dateFrom && dateFrom !== undefined && new Date(dateFrom) instanceof Date
          ? new Date(dateFrom)
          : new Date(),
        dateTo && dateTo !== undefined && new Date(dateTo) instanceof Date
          ? new Date(dateTo)
          : new Date(),
        assignedUserId
      );
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }
}
