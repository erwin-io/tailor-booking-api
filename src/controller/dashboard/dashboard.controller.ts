import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { CustomResponse } from "src/common/helper/customresponse.helpers";
import { JwtAuthGuard } from "src/core/auth/jwt.auth.guard";
import { DashboardService } from "src/services/dashboard.service";

@Controller("dashboard")
@ApiTags("dashboard")
@ApiBearerAuth("jwt")
export class DashboardController {
  constructor(private readonly dashboardServiceService: DashboardService) {}

  @Get("getTotalDueForAMonthBy")
  @ApiQuery({ name: "month", required: false })
  @ApiQuery({ name: "year", required: false })
  @UseGuards(JwtAuthGuard)
  async getTotalDueForAMonthBy(
    @Query("month") month = new Date().getMonth(),
    @Query("year") year = new Date().getFullYear()
  ) {
    const res: CustomResponse = {};
    try {
      res.data = await this.dashboardServiceService.getTotalDueForAMonthBy(Number(month), Number(year))
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Get("getTotalDueByDays")
  @ApiQuery({ name: "date", required: false })
  @ApiQuery({ name: "days", required: false })
  @UseGuards(JwtAuthGuard)
  async getTotalDueByDays(
    @Query("days") days = 1,
    @Query("date") date = new Date()
  ) {
    const res: CustomResponse = {};
    try {
      res.data = await this.dashboardServiceService.getTotalDueByDays(Number(days), new Date(date))
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Get("getTotalOverDue")
  @ApiQuery({ name: "date", required: false })
  @UseGuards(JwtAuthGuard)
  async getTotalOverDue(
    @Query("date") date = new Date()
  ) {
    const res: CustomResponse = {};
    try {
      res.data = await this.dashboardServiceService.getTotalOverDue(new Date(date))
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Get("getCustomerDashboard")
  @ApiQuery({ name: "customerId", required: false })
  @UseGuards(JwtAuthGuard)
  async getCustomerDashboard(
    @Query("customerId") customerId = ""
  ) {
    const res: CustomResponse = {};
    try {
      res.data = await this.dashboardServiceService.getCustomerDashboard(customerId)
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }
}
