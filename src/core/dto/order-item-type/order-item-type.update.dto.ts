import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class OrderItemTypeDto {
  @ApiProperty()
  @IsNotEmpty()
  orderItemTypeId: string;

  @ApiProperty()
  @IsNotEmpty()
  name: string;
}
