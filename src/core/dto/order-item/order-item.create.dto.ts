import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString } from "class-validator";

export class CreateOrderItemDto {
    @ApiProperty()
    @IsNotEmpty()
    orderItemTypeId: string;
    
    @ApiProperty()
    @IsNotEmpty()
    @IsNumberString()
    quantity: string = "0";
    
    @ApiProperty()
    @IsNotEmpty()
    remarks: string;
}
