import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsDateString, IsMilitaryTime, IsNotEmpty, IsOptional } from "class-validator";
import * as moment from "moment";

export class CreateReservationDto {
  @ApiProperty({
    type: Date,
    default: moment().format("YYYY-MM-DD"),
  })
  @IsDateString()
  @Type(() => Date)
  @Transform((value) => moment(new Date(value.value)).format("YYYY-MM-DD"))
  @IsNotEmpty()
  reservationDate: Date;

  @ApiProperty({
    default: moment().format("HH:MM"),
  })
  @IsMilitaryTime()
  @IsNotEmpty()
  time: string;

  @ApiProperty()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty()
  @IsNotEmpty()
  reservationTypeId: string;

  @ApiProperty()
  @IsOptional()
  massCategoryId: string;

  @ApiProperty()
  @IsOptional()
  massIntentionTypeId: string;

  @ApiProperty()
  @IsOptional()
  remarks: string;
}
