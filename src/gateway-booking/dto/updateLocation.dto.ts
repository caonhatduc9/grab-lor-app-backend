import { IsNotEmpty, IsString } from "class-validator";



class locationDto {
    @IsNotEmpty()
    @IsString()
    lat: string;
    @IsNotEmpty()
    @IsString()
    lon: string;
}
export class UpdateLocationDto {
    @IsNotEmpty()
    @IsString()
    customerId: string;
    @IsNotEmpty()
    location: locationDto;
}