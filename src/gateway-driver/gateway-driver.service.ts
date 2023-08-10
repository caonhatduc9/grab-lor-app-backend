import { Inject, Injectable } from '@nestjs/common';
import { CreateGatewayDriverDto } from './dto/create-gateway-driver.dto';
import { UpdateGatewayDriverDto } from './dto/update-gateway-driver.dto';
import { Server } from 'socket.io'
import { Repository } from 'typeorm';
import { WebSocketServer } from '@nestjs/websockets';
import { SocketDriver } from 'src/entities/socketDriver.entity';
import { UserService } from 'src/user/user.service';
import { SocketCustomer } from 'src/entities/socketCustomer.entity';

@Injectable()
export class GatewayDriverService {
  // private server: Server;
  constructor(@Inject('SOCKET_DRIVER_REPOSITORY') private gatewayDriverRepository: Repository<SocketDriver>,
    @Inject('SOCKET_CUSTOMER_REPOSITORY') private gatewayCustomerRepository: Repository<SocketCustomer>,// private userService: UserService
  ) { }


  async addDriverSocket(driverId: string, socketId: string): Promise<SocketDriver> {
    // const driver = await this.userService.getDriver(+driverId);
    const newSoketDriver = new SocketDriver();
    newSoketDriver.driverId = +driverId;
    newSoketDriver.socketId = socketId;
    return this.gatewayDriverRepository.save(newSoketDriver);
  }

  async getDriverSocketById(driverId: number): Promise<SocketDriver> {
    const socket = await this.gatewayDriverRepository.findOne({ where: { driverId } });
    // console.log("socket", socket.socketId);
    return socket;
  }

  async removeDriverSocket(driverId: number): Promise<void> {
    await this.gatewayDriverRepository.delete({ driverId });
  }


  async addCustomerSocket(customerId: string, socketId: string): Promise<SocketCustomer> {
    // const driver = await this.userService.getDriver(+driverId);
    const newSoketCustomer = new SocketCustomer();
    newSoketCustomer.customerId = +customerId;
    newSoketCustomer.socketId = socketId;
    return this.gatewayCustomerRepository.save(newSoketCustomer);
  }

  async getCustomerSocketById(customerId: number): Promise<SocketCustomer> {
    const socket = await this.gatewayCustomerRepository.findOne({ where: { customerId } });
    // console.log("socket", socket.socketId);
    return socket;
  }

  async removeCustomerSocket(customerId: number): Promise<void> {
    await this.gatewayCustomerRepository.delete({ customerId });
  }
  // async sendRideRequestToDriver(driverId: string, payload: any) {
  //   const socketId = await this.getDriverSocketId(driverId);
  //   if (socketId) {
  //     this.gatewayDriverGateway.server.to(socketId).emit('rideRequest', payload);
  //   }
  // }
}
