import { PartialType } from '@nestjs/mapped-types';
import { CreateGatewayDriverDto } from './create-gateway-driver.dto';

export class UpdateGatewayDriverDto extends PartialType(
  CreateGatewayDriverDto,
) {
  id: number;
}
