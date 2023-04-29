import { ApiProperty } from "@nestjs/swagger";
import { IsBase64, IsNotEmpty, IsNumberString, IsOptional, IsString } from "class-validator";

export class CreateOrderItemDto {
    @ApiProperty()
    @IsNotEmpty()
    orderItemTypeId: string;
    
    @ApiProperty()
    @IsNotEmpty()
    quantity: string = "1";
    
    @ApiProperty()
    @IsNotEmpty()
    remarks: string;

    @ApiProperty()
    @IsOptional()
    orderItemAttachments: AddOrderItemAttachmentDto[];
}

export class AddOrderItemAttachmentDto {
  @ApiProperty()
  @IsString()
  fileName: string;

  @ApiProperty()
  @IsBase64()
  data: any;
}