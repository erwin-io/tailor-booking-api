import { ApiProperty } from "@nestjs/swagger";
import { Type, Transform } from "class-transformer";
import { IsDateString, IsMilitaryTime, IsNotEmpty, IsOptional } from "class-validator";
import * as moment from "moment";

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
}

export class ProcessOrderDto extends ReservationDto {
  @ApiProperty()
  @IsNotEmpty()
  staffId: string;
  
  @ApiProperty({
    type: Date,
    default: moment().format("YYYY-MM-DD"),
  })
  @IsDateString()
  @Type(() => Date)
  @Transform((value) => moment(new Date(value.value)).format("YYYY-MM-DD"))
  @IsNotEmpty()
  estCompletionDate: Date;
}