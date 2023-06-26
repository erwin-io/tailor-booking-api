import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CustomResponse } from "src/common/helper/customresponse.helpers";
import { ReportsService } from "src/services/reports.service";
import { Response } from "express";
import { Readable, Stream } from "stream";
import { JwtAuthGuard } from "src/core/auth/jwt.auth.guard";

@ApiTags("reports")
@Controller("reports")
// @ApiBearerAuth("jwt")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("getSalesAdvance")
  @ApiQuery({ name: "dateFrom", required: false, type: Date })
  @ApiQuery({ name: "dateTo", required: false, type: Date })
  // @UseGuards(JwtAuthGuard)
  async getSalesAdvance(
    @Query("dateFrom") dateFrom = new Date(),
    @Query("dateTo") dateTo = new Date()
  ) {
    const res: CustomResponse = {};
    try {
      const res: CustomResponse = {};
      res.data = await this.reportsService.getSalesAdvance(
        dateFrom && dateFrom !== undefined && new Date(dateFrom) instanceof Date
          ? new Date(dateFrom)
          : new Date(),
        dateTo && dateTo !== undefined && new Date(dateTo) instanceof Date
          ? new Date(dateTo)
          : new Date()
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
