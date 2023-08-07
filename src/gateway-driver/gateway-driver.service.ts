import { Injectable } from '@nestjs/common';
import { CreateGatewayDriverDto } from './dto/create-gateway-driver.dto';
import { UpdateGatewayDriverDto } from './dto/update-gateway-driver.dto';

@Injectable()
export class GatewayDriverService {
  create(createGatewayDriverDto: CreateGatewayDriverDto) {
    return 'This action adds a new gatewayDriver';
  }

  findAll() {
    return `This action returns all gatewayDriver`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gatewayDriver`;
  }

  update(id: number, updateGatewayDriverDto: UpdateGatewayDriverDto) {
    return `This action updates a #${id} gatewayDriver`;
  }

  remove(id: number) {
    return `This action removes a #${id} gatewayDriver`;
  }
}
