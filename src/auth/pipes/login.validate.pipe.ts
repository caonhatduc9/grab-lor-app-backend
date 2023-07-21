import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { LoginDto } from '../dto/auth.login.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

Injectable();
export class LoginValidationPipe implements PipeTransform {
  async transform(value: any) {
    const loginDto = plainToClass(LoginDto, value);
    const errors = await validate(loginDto);
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }
    return loginDto;
  }
}
