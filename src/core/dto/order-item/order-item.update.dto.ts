import { ApiProperty } from "@nestjs/swagger";
import { IsBase64, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsPositive, IsString } from "class-validator";
import { AddOrderItemAttachmentDto } from "./order-item.create.dto";


export class AddOrderItemDto {
    @ApiProperty()
    @IsNotEmpty()
    orderItemTypeId: string;
    
    @ApiProperty()
    @IsNotEmpty()
    remarks: string;

    @ApiProperty()
    @IsNotEmpty()
    reservationId: string;
    
    @ApiProperty()
    @IsNotEmpty()
    quantity: string = "1";

    @ApiProperty()
    @IsOptional()
    orderItemAttachments: AddOrderItemAttachmentDto[];
}

export class OrderItemDto extends AddOrderItemDto {
    @ApiProperty()
    @IsNotEmpty()
    orderItemId: string;
}

export class OrderItemAttachmentDto extends AddOrderItemAttachmentDto {
    @ApiProperty()
    @IsNotEmpty()
    orderItemId: string;
}