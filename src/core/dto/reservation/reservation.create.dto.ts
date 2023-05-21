import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsDateString, IsMilitaryTime, IsNotEmpty, IsOptional } from "class-validator";
import * as moment from "moment";
import { CreateOrderItemDto } from "../order-item/order-item.create.dto";
import { DateConstant } from "src/common/constant/date.constant";

export class CreateReservationDto {
  @ApiProperty({
    type: Date,
    default: moment(new Date(), DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD"),
  })
  @IsDateString()
  @Type(() => Date)
  @Transform((value) => moment(new Date(value.value), DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD"))
  @IsNotEmpty()
  reqCompletionDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty()
  @IsNotEmpty()
  reservationLevelId: string;

  @ApiProperty()
  @IsOptional()
  description: string;

  @ApiProperty({
    isArray: true,
    type: CreateOrderItemDto
  })
  @IsNotEmpty()
  orderItems: CreateOrderItemDto[] = [];
}



