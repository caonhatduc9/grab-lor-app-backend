import { Inject, Injectable } from '@nestjs/common';
// import { CreateGatewayDriverDto } from './dto/create-gateway-driver.dto';
// import { UpdateGatewayDriverDto } from './dto/update-gateway-driver.dto';
import { Server } from 'socket.io';
import { Repository } from 'typeorm';
import { WebSocketServer } from '@nestjs/websockets';
import { SocketDriver } from 'src/entities/socketDriver.entity';
import { UserService } from 'src/user/user.service';
import { SocketCustomer } from 'src/entities/socketCustomer.entity';
import { async } from 'rxjs';

@Injectable()
export class GatewayBookingService {
  // private server: Server;
  constructor(
    @Inject('SOCKET_DRIVER_REPOSITORY')
    private gatewayDriverRepository: Repository<SocketDriver>,
    @Inject('SOCKET_CUSTOMER_REPOSITORY')
    private gatewayCustomerRepository: Repository<SocketCustomer>, // private userService: UserService
    private userService: UserService,
  ) {}

  async addDriverSocket(
    driverId: number,
    socketId: string,
  ): Promise<SocketDriver> {
    // const driver = await this.userService.getDriver(+driverId);
    const existingSocket = await this.gatewayDriverRepository.findOne({
      where: { driverId },
    });

    if (!existingSocket) {
      const newSoketDriver = new SocketDriver();
      newSoketDriver.driverId = +driverId;
      newSoketDriver.socketId = socketId;
      return this.gatewayDriverRepository.save(newSoketDriver);
    } else {
      existingSocket.socketId = socketId;
      return this.gatewayDriverRepository.save(existingSocket);
    }
  }

  async getDriverSocketById(driverId: number): Promise<SocketDriver> {
    const socket = await this.gatewayDriverRepository.findOne({
      where: { driverId },
    });
    return socket;
  }

  async removeDriverSocket(driverId: number): Promise<void> {
    await this.gatewayDriverRepository.delete({ driverId });
  }

  async addCustomerSocket(
    customerId: number,
    socketId: string,
  ): Promise<SocketCustomer> {
    const existingSocket = await this.gatewayCustomerRepository.findOne({
      where: { customerId },
    });

    if (!existingSocket) {
      const newSoketCustomer = new SocketCustomer();
      newSoketCustomer.customerId = customerId;
      newSoketCustomer.socketId = socketId;
      return this.gatewayCustomerRepository.save(newSoketCustomer);
    } else {
      existingSocket.socketId = socketId;
      return this.gatewayCustomerRepository.save(existingSocket);
    }
  }

  async getCustomerSocketById(customerId: number): Promise<SocketCustomer> {
    const socket = await this.gatewayCustomerRepository.findOne({
      where: { customerId },
    });
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
  async updateLocationDriver(driverId: number, location: any): Promise<any> {
    return await this.userService.updateLocationDriver(driverId, location);
  }
}
