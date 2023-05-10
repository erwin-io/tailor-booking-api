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
  

  @Get("getPaymentsInvoice")
  @ApiQuery({ name: "paymentId", required: false })
  // @UseGuards(JwtAuthGuard)
  async getPaymentsInvoice(
    @Query("paymentId") paymentId: string = "",
    @Res() response: Response
  ) {
    const res: CustomResponse = {};
    try {
      const stream: Stream = await this.reportsService.getPaymentsInvoice(paymentId);

      response.set({
        "Content-Type": "application/pdf",
      });

      stream.pipe(response);
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      response.send(res);
    }
  }
}
