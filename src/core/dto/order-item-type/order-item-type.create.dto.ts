import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateOrderItemTypeDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;
}