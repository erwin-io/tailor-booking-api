import { ApiProperty } from "@nestjs/swagger";
import { Type, Transform } from "class-transformer";
import {
  IsDateString,
  IsMilitaryTime,
  IsNotEmpty,
  IsOptional,
} from "class-validator";
import * as moment from "moment";

export class RequestDto {
  @ApiProperty()
  @IsNotEmpty()
  requestId: string;
}

export class UpdateRequestDto extends RequestDto {
  @ApiProperty()
  @IsNotEmpty()
  clientId: string;
  
  @ApiProperty()
  @IsNotEmpty()
  requestersFullName: string;
  
  @ApiProperty()
  @IsOptional()
  husbandFullName: string;
  
  @ApiProperty()
  @IsOptional()
  wifeFullName: string;

  @ApiProperty()
  @IsOptional()
  remarks: string;
  
  @ApiProperty({
    type: Date,
    default: moment().format("YYYY-MM-DD"),
  })
  @IsDateString()
  @Type(() => Date)
  @Transform((value) => moment(new Date(value.value)).format("YYYY-MM-DD"))
  @IsNotEmpty()
  referenceDate: Date;
}

export class UpdateRequestStatusDto extends RequestDto {
  @ApiProperty()
  @IsNotEmpty()
  requestStatusId: string;

  @ApiProperty()
  @IsOptional()
  adminRemarks;
}
