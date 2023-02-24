import { ApiProperty } from "@nestjs/swagger";
import { Type, Transform } from "class-transformer";
import { IsDateString, IsMilitaryTime, IsNotEmpty, IsOptional } from "class-validator";
import * as moment from "moment";

export class ReservationDto {
  @ApiProperty()
  @IsNotEmpty()
  reservationId: string;
}

export class UpdateReservationDto extends ReservationDto {
  @ApiProperty({
    type: Date,
    default: moment().format("YYYY-MM-DD"),
  })
  @IsDateString()
  @Type(() => Date)
  @Transform((value) => moment(new Date(value.value)).format("YYYY-MM-DD"))
  @IsNotEmpty()
  reservationDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty()
  @IsNotEmpty()
  reservationTypeId: string;

  @ApiProperty()
  @IsOptional()
  remarks: string;
}


export class RescheduleReservationDto extends ReservationDto {
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
}

export class UpdateReservationStatusDto extends ReservationDto {
  @ApiProperty()
  @IsNotEmpty()
  reservationStatusId: string;
  
  @ApiProperty()
  @IsOptional()
  adminRemarks;
}
