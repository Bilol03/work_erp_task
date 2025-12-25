import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class startEndDateDto {
    @ApiProperty({ required: false, example: '2025-01-01', description: 'Start Date' })
    @IsString()
    @IsOptional()
    startDate: string;

    @ApiProperty({ required: false, example: '2025-01-31', description: 'End Date' })
    @IsString()
    @IsOptional()
    endDate: string;
}