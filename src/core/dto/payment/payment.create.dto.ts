import { ApiProperty } from "@nestjs/swagger";
import { Type, Transform } from "class-transformer";
import { IsDateString, IsNotEmpty, IsString } from "class-validator";
import * as moment from "moment";
import { DateConstant } from "src/common/constant/date.constant";

export class CreatePaymentDto {
  @ApiProperty({
    type: Date,
    default: moment(new Date(), DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD"),
  })
  @IsDateString()
  @Type(() => Date)
  @Transform((value) => moment(new Date(value.value), DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD"))
  @IsNotEmpty()
  paymentDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  paymentTypeId: string;

  @ApiProperty()
  @IsNotEmpty()
  reservationId: string;

  @ApiProperty()
  @IsString()
  referenceNo: string;
}
