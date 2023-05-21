import { ApiProperty } from "@nestjs/swagger";
import { Type, Transform } from "class-transformer";
import { IsDateString, IsMilitaryTime, IsNotEmpty, IsOptional } from "class-validator";
import * as moment from "moment";
import { DateConstant } from "src/common/constant/date.constant";

export class ReservationDto {
  @ApiProperty()
  @IsNotEmpty()
  reservationId: string;
}

export class UpdateReservationStatusDto extends ReservationDto {
  @ApiProperty()
  @IsNotEmpty()
  reservationStatusId: string;
  
  @ApiProperty()
  @IsOptional()
  adminRemarks;

  @ApiProperty()
  @IsNotEmpty()
  otherFee: string = "0";
}

export class ProcessOrderDto extends ReservationDto {
  @ApiProperty()
  @IsNotEmpty()
  assignedStaffId: string;
  
  @ApiProperty({
    type: Date,
    default: moment(new Date(), DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD"),
  })
  @IsDateString()
  @Type(() => Date)
  @Transform((value) => moment(new Date(value.value), DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD"))
  @IsNotEmpty()
  estCompletionDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  serviceFee: string = "0";
}