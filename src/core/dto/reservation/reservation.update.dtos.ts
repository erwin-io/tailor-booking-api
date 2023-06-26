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

export class ApproveOrderDto extends ReservationDto {
  @ApiProperty({
    type: Date,
    default: moment(new Date(), DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD HH:mm:ss"),
  })
  @IsDateString()
  @Type(() => Date)
  @Transform((value) => moment(new Date(value.value), DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD HH:mm:ss"))
  @IsNotEmpty()
  submitItemsBeforeDateTime: Date;
}

export class ProcessOrderDto extends ReservationDto {
  @ApiProperty()
  @IsNotEmpty()
  assignedStaffId: string;
  
  @ApiProperty({
    type: Date,
    default: moment(new Date(), DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD HH:mm:ss"),
  })
  @IsDateString()
  @Type(() => Date)
  @Transform((value) => moment(new Date(value.value), DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD HH:mm:ss"))
  @IsNotEmpty()
  estCompletionDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  serviceFee: string = "0";
}

export class CompleteOrderDto extends ReservationDto {
  @ApiProperty({
    type: Date,
    default: moment(new Date(), DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD HH:mm:ss"),
  })
  @IsDateString()
  @Type(() => Date)
  @Transform((value) => moment(new Date(value.value), DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD HH:mm:ss"))
  @IsNotEmpty()
  toPickupDateTime: Date;


  @ApiProperty()
  @IsNotEmpty()
  otherFee: string = "0";
}

export class DeclineOrderDto extends ReservationDto {
  @ApiProperty()
  @IsNotEmpty()
  reasonToDecline: string;
}