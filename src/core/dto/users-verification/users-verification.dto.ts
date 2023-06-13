import {
  IsNotEmpty,
  IsEmail,
  IsDate,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import * as moment from "moment";

export class UserVerificationDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  mobileNumber: string;
}

export class VerifyOtpDto extends UserVerificationDto {
  @ApiProperty()
  @IsNotEmpty()
  otp: string;
}