import { Controller, Get, Query, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CustomResponse } from "src/common/helper/customresponse.helpers";
import { ActivityLogService } from "src/services/activity-log.service";
import { Stream } from "stream";
import * as moment from "moment";
import { DateConstant } from "src/common/constant/date.constant";

@ApiTags("activity-log")
@Controller("activity-log")
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get("getUserLogActivity")
  @ApiQuery({ name: "userTypeId", required: false })
  @ApiQuery({ name: "activityTypeId", required: false })
  @ApiQuery({ name: "name", required: false })
  @ApiQuery({ name: "dateFrom", required: false })
  @ApiQuery({ name: "dateTo", required: false })
  async getUserLogActivity(
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Query("userTypeId") userTypeId = 0,
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Query("activityTypeId") activityTypeId = "",
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Query("name") name: string = "",
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Query("dateFrom") dateFrom = new Date(),
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Query("dateTo") dateTo = new Date(),
  ) {
    const res: CustomResponse = {};
    try {
      res.data = await this.activityLogService.findByFilter(
        userTypeId.toString(),
        activityTypeId.toString().split(","),
        name,
        new Date(moment(dateFrom, DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD")),
        new Date(moment(dateTo, DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD"))
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
