import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CustomResponse } from "src/common/helper/customresponse.helpers";
import { JwtAuthGuard } from "src/core/auth/jwt.auth.guard";
import { CreateReservationDto } from "src/core/dto/reservation/reservation.create.dto";
import {
  ProcessOrderDto,
  UpdateReservationStatusDto,
} from "src/core/dto/reservation/reservation.update.dtos";
import { ReservationService } from "src/services/reservation.service";

@ApiTags("reservation")
@Controller("reservation")
@ApiBearerAuth("jwt")
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get("getByStatus")
  @ApiQuery({ name: "customerId", required: false })
  @ApiQuery({ name: "reservationStatus", required: false })
  @UseGuards(JwtAuthGuard)
  async getByStatus(
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Query("customerId") customerId: string = "",
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Query("reservationStatus")
    reservationStatus: string = ""
  ) {
    const res: CustomResponse = {};
    try {
      res.data = await this.reservationService.getByStatus(
        customerId,
        reservationStatus.trim() === "" ? [] : reservationStatus.split(",")
      );
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Get("getByAdvanceSearch")
  @ApiQuery({ name: "isAdvance", required: false })
  @ApiQuery({ name: "keyword", required: false })
  @ApiQuery({ name: "customerName", required: false })
  @ApiQuery({ name: "reservationStatus", required: false })
  @ApiQuery({ name: "reqCompletionDateFrom", type: Date, required: false })
  @ApiQuery({ name: "reqCompletionDateTo", type: Date, required: false })
  @UseGuards(JwtAuthGuard)
  async getByAdvanceSearch(
    @Query("isAdvance") isAdvance: boolean,
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Query("keyword") keyword: string = "",
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Query("customerName") customerName: string = "",
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Query("reservationStatus")
    reservationStatus: string = "",
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Query("reqCompletionDateFrom") reqCompletionDateFrom: Date = new Date(),
    @Query("reqCompletionDateTo") reqCompletionDateTo: Date = new Date()
  ) {
    const res: CustomResponse = {};
    try {
      res.data = await this.reservationService.findByFilter(
        isAdvance,
        keyword,
        customerName,
        reservationStatus.trim() === "" ? [] : reservationStatus.split(","),
        reqCompletionDateFrom,
        reqCompletionDateTo
      );
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Get(":reservationId")
  @UseGuards(JwtAuthGuard)
  async getById(@Param("reservationId") reservationId: string) {
    const res: CustomResponse = {};
    try {
      res.data = await this.reservationService.findById(reservationId);
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Post("createReservation")
  @UseGuards(JwtAuthGuard)
  async createReservation(@Body() dto: CreateReservationDto) {
    const res: CustomResponse = {};
    try {
      const res: CustomResponse = {};
      res.data = await this.reservationService.createReservation(dto);
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Put("updateReservationStatus")
  @UseGuards(JwtAuthGuard)
  async updateReservationStatus(@Body() dto: UpdateReservationStatusDto) {
    const res: CustomResponse = {};
    try {
      const res: CustomResponse = {};
      res.data = await this.reservationService.updateStatus(dto);
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Put("processOrder")
  @UseGuards(JwtAuthGuard)
  async processOrder(@Body() dto: ProcessOrderDto) {
    const res: CustomResponse = {};
    try {
      const res: CustomResponse = {};
      res.data = await this.reservationService.processOrder(dto);
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }
}
