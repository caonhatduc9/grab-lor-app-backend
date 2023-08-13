import { Inject, Injectable } from '@nestjs/common';
// import { CreateGatewayDriverDto } from './dto/create-gateway-driver.dto';
// import { UpdateGatewayDriverDto } from './dto/update-gateway-driver.dto';
import { Server } from 'socket.io';
import { Repository } from 'typeorm';
import { WebSocketServer } from '@nestjs/websockets';
import { SocketDriver } from 'src/entities/socketDriver.entity';
import { UserService } from 'src/user/user.service';
import { SocketCustomer } from 'src/entities/socketCustomer.entity';
import { GoogleMapsService } from '../shareModule/googleMap.service';
import { BookingService } from '../booking/booking.service';

@Injectable()
export class GatewayBookingService {
  // private server: Server;
  constructor(
    @Inject('SOCKET_DRIVER_REPOSITORY')
    private gatewayDriverRepository: Repository<SocketDriver>,
    @Inject('SOCKET_CUSTOMER_REPOSITORY')
    private readonly gatewayCustomerRepository: Repository<SocketCustomer>, // private userService: UserService
    private readonly userService: UserService,
    private googleMapService: GoogleMapsService,
    private readonly bookingService: BookingService,
  ) { }

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
    // console.log('driverId', driverId);
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
    const res = await this.userService.updateLocationDriver(driverId, location);
    if (res) {
      return {
        statusCode: 200,
        message: 'Update location successfully',
        currentLocation: res,
      };
    }
    return {
      statusCode: 500,
      message: 'Update location failed',
    };
  }

  async findNearestDriverOnline(payload: any): Promise<any> {
    const drivers = await this.userService.getDriversOnline();
    if (drivers.length === 0) return {
      statusCode: 404,
      message: 'No available driver found',
    };
    try {
      const nearestDriver = await this.googleMapService.findNearestDriver(
        payload.pickup,
        drivers,
      );
      return nearestDriver;
    }
    catch (err) {
      return {
        statusCode: 404,
        message: 'No available driver found',
      };
    }
  }


  // async createBooking(body: any): Promise<any> {
  //   const { pickup, destination, vehicleType, paymentMethod } = body;
  //   const drivers = await this.userService.getDriversOnline();
  //   const customer = await this.bookingService.getInforCustomer(+body.customerId);
  //   try {
  //     // find nearest driver
  //     const nearestDriver = await this.googleMapService.findNearestDriver(
  //       body.pickup,
  //       drivers,
  //     );
  //     // console.log("nearestDriver", nearestDriver);
  //     const driverSocket = await this.getDriverSocketById(
  //       nearestDriver.driverId,
  //     );
  //     //send request book to the driver
  //     if (driverSocket) {
  //       this.sendRideRequestToDriver(
  //         nearestDriver.driverId,
  //         { customer, pickup, destination, vehicleType, paymentMethod },
  //       );
  //       return {
  //         statusCode: 200,
  //         message: 'Ride requested',
  //         nearestDriver: nearestDriver,
  //       };
  //     } else {
  //       return {
  //         statusCode: 404,
  //         message: 'Driver not available',
  //       };
  //     }
  //   } catch (error) {
  //     return {
  //       statusCode: 404,
  //       message: 'No available driver found',
  //     };
  //   }
  // }

}
