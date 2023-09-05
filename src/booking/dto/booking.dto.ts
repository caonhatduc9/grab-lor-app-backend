import { IsEmail, IsString } from 'class-validator';

export class CreateBookingPostitionDto {
    @IsString()
    readonly customerName: string;
    @IsString()
    readonly phoneNumber: string;
    @IsString()
    readonly pickupAddress: string;
    @IsString()
    readonly destAddress: string;
    readonly time: Date;
}
