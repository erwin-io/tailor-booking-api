import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString } from "class-validator";

export class CreateOrderItemDto {
    @ApiProperty()
    @IsNotEmpty()
    orderItemTypeId: string;
    
    @ApiProperty()
    @IsNotEmpty()
    @IsNumberString()
    quantity: Number = 1;
    
    @ApiProperty()
    @IsNotEmpty()
    remarks: string;
}
