import { IsNotEmpty, IsString } from "class-validator";

export class UpdateLocationDto {
    @IsNotEmpty()
    @IsString()
    lat: string;

    @IsNotEmpty()
    @IsString()
    lon: string;
}