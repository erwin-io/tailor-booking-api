import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsNumberString, IsPositive } from "class-validator";


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
    @IsNumberString()
    quantity: string = "0";
}

export class OrderItemDto extends AddOrderItemDto {
    @ApiProperty()
    @IsNotEmpty()
    orderItemId: string;
}