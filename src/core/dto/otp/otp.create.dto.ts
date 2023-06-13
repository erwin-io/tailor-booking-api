import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsObject, IsString, ValidateNested } from "class-validator";

export class SendOTPDto {
  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Array<MessageSendOTPDto>)
  messages: MessageSendOTPDto[];
}

export class MessageSendOTPDto {
  @ApiProperty()
  @IsString()
  from?: string;

  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Array<DestinationSendOTPDto>)
  destinations: DestinationSendOTPDto[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  text: string;
}

export class DestinationSendOTPDto {
  @ApiProperty()
  @IsNotEmpty()
  to: string;
}
