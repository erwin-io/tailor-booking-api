import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsDateString,
  IsMilitaryTime,
  IsNotEmpty,
  IsOptional,
} from "class-validator";
import * as moment from "moment";
export class CreateBaptismalCertificateRequestDto {
  @ApiProperty({
    type: Date,
    default: moment().format("YYYY-MM-DD"),
  })
  @IsDateString()
  @Type(() => Date)
  @Transform((value) => moment(new Date(value.value)).format("YYYY-MM-DD"))
  @IsNotEmpty()
  dateBaptized: Date;
  
  @ApiProperty()
  @IsNotEmpty()
  requestersFullName: string;

  @ApiProperty()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty()
  @IsOptional()
  remarks: string;
}

export class CreateConfirmationCertificateRequesDto {
  @ApiProperty({
    type: Date,
    default: moment().format("YYYY-MM-DD"),
  })
  @IsDateString()
  @Type(() => Date)
  @Transform((value) => moment(new Date(value.value)).format("YYYY-MM-DD"))
  @IsNotEmpty()
  dateOfConfirmation: Date;
  
  @ApiProperty()
  @IsNotEmpty()
  requestersFullName: string;

  @ApiProperty()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty()
  @IsOptional()
  remarks: string;
}

export class CreateMarriageContractCertificateRequesDto {
  @ApiProperty({
    type: Date,
    default: moment().format("YYYY-MM-DD"),
  })
  @IsDateString()
  @Type(() => Date)
  @Transform((value) => moment(new Date(value.value)).format("YYYY-MM-DD"))
  @IsNotEmpty()
  dateMarried: Date;
  
  @ApiProperty()
  @IsNotEmpty()
  husbandFullName: string;
  
  @ApiProperty()
  @IsNotEmpty()
  wifeFullName: string;


  @ApiProperty()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty()
  @IsOptional()
  remarks: string;
}
