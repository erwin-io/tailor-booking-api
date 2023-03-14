import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString } from "class-validator";

export class CreateOrderItemDto {
    @ApiProperty()
    @IsNotEmpty()
    orderItemTypeId: string;
    
    @ApiProperty()
    @IsNotEmpty()
    @IsNumberString()
    quantity: number = 1;
    
    @ApiProperty()
    @IsNotEmpty()
    remarks: string;
}
