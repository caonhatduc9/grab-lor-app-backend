import { IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    username: string;
    
    @IsString()
    @IsOptional()
    phoneNumber: string;
  
    @IsOptional()
    avatar: Express.Multer.File; // This field will hold the uploaded avatar file
  }