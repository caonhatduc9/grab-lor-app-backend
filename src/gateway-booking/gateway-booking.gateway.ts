import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { UpdateLocationDto } from './dto/updateLocation.dto';
import { GatewayBookingService } from './gateway-booking.service';
import { UserService } from '../user/user.service';
import { timeOutResponseDriver, timeIntervalResponseDriver } from '../config/booking.config';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
@WebSocketGateway()
export class GatewayBookingGateway {
  @WebSocketServer() server: Server;
  public driverResponses: Map<string, any>;

  constructor(
    private readonly gatewayBookingService: GatewayBookingService,
    private readonly userService: UserService,
    @InjectQueue('createBooking') private createBookingQueue: Queue
  ) {
    this.driverResponses = new Map<string, any>();
  }

  handleConnection(client: Socket) {
    const driverId = client.handshake.query.driverId as string;
    const customerId = client.handshake.query.customerId as string;

    if (driverId) {
      this.handleDriverConnection(driverId, client.id);
    }

    if (customerId) {
      this.handleCustomerConnection(customerId, client.id);
    }
  }

  handleDisconnect(client: Socket) {
    const driverId = client.handshake.query.driverId as string;
    const customerId = client.handshake.query.customerId as string;

    if (driverId) {
      this.handleDriverDisconnect(driverId);
    }

    if (customerId) {
      this.handleCustomerDisconnect(customerId);
    }
  }

  private async handleDriverConnection(driverId: string, socketId: string) {
    console.log('Driver connected: ' + socketId);
    this.gatewayBookingService.addDriverSocket(+driverId, socketId);
    this.userService.updateStatusDriver(+driverId, 'online');
  }

  private async handleDriverDisconnect(driverId: string) {
    console.log('Driver disconnected: ' + driverId);
    this.gatewayBookingService.removeDriverSocket(+driverId);
    this.userService.updateStatusDriver(+driverId, 'offline');
  }

  private async handleCustomerConnection(customerId: string, socketId: string) {
    console.log('Customer connected: ' + socketId);
    this.gatewayBookingService.addCustomerSocket(+customerId, socketId);
  }

  private async handleCustomerDisconnect(customerId: string) {
    console.log('Customer disconnected: ' + customerId);
    this.gatewayBookingService.removeCustomerSocket(+customerId);
  }

  @SubscribeMessage('updateLocationDriver')
  async handleUpdateLocationDriver(client: Socket, payload: UpdateLocationDto) {
    const driverId = client.handshake.query.driverId as string;
    const res = await this.gatewayBookingService.updateLocationDriver(+driverId, payload.location);
    const customerSocket = await this.gatewayBookingService.getCustomerSocketById(+payload.customerId);
    this.server.to(customerSocket.socketId).emit('updateLocationDriver', res);
    return res;
  }

  @SubscribeMessage('driverResponse')
  async handleDriverResponse(client: Socket, payload: any) {
    const driverId = client.handshake.query.driverId as string;
    this.driverResponses.set(client.id, payload.status);

    const driverSocket = await this.gatewayBookingService.getDriverSocketById(+driverId);
    this.server.to(driverSocket.socketId).emit('driverResponse', {
      statusCode: 200,
      message: 'accepted',
    });
  }

  @SubscribeMessage('createBooking')
  async handleCreateBooking(client: Socket, payload: any) {

    const customerId = client.handshake.query.customerId as string;
    payload.customerId = customerId;
    await this.createBookingQueue.add('createBooking', payload, {
      removeOnComplete: true,
    });

    // try {
    //   const { pickup, destination, vehicleType, price, paymentMethod } = payload;
    //   const customer = await this.gatewayBookingService.getInforCustomer(+customerId);
    //   const nearestDriver = await this.gatewayBookingService.findNearestDriverOnline(pickup);

    //   if (nearestDriver.statusCode === 404) {
    //     this.sendDriverInfoToCustomer(+customerId, {
    //       statusCode: 404,
    //       message: 'No available driver found, please try again later',
    //     });
    //     return;
    //   }
    //   try {
    //     const driverSocket = await this.gatewayBookingService.getDriverSocketById(nearestDriver.driverId);

    //     if (driverSocket) {
    //       const driverResponse = await this.sendRideRequestToDriver(
    //         nearestDriver.driverId,
    //         { customer, pickup, destination, vehicleType, price, paymentMethod, customerId },
    //       );

    //       if (driverResponse === 'accept') {
    //         this.userService.updateStatusDriver(+nearestDriver.driverId, 'driving');
    //         this.sendDriverInfoToCustomer(+customerId, {
    //           statusCode: 200,
    //           message: 'accepted',
    //           driverInfo: nearestDriver,
    //         });
    //       }
    //     } else {
    //       //tai xe tu choi cuoc xe
    //       // this.sendDriverInfoToCustomer(+customerId, { message: 'Driver not available' });
    //     }
    //   } catch (error) {
    //     console.log("Failed to send driver info", error);
    //     //cho nay can danh dau tai xe da bỏ qua cuoc xe 
    //   }
    // } catch (error) {
    //   this.sendDriverInfoToCustomer(payload.customerId, {
    //     statusCode: 500,
    //     message: 'Error requesting ride',
    //   });
    // }
  }

  async sendRideRequestToDriver(driverId: string, payload: any): Promise<string> {
    const socket = await this.gatewayBookingService.getDriverSocketById(+driverId);
    const socketId = socket.socketId;

    if (socketId) {
      this.server.to(socket.socketId).emit('rideRequest', payload);

      return new Promise((resolve, reject) => {
        let timeoutId: any;
        const interval = setInterval(() => {
          if (this.driverResponses.has(socketId)) {
            clearInterval(interval);
            clearTimeout(timeoutId);
            resolve(this.driverResponses.get(socketId));
          }
        }, timeIntervalResponseDriver);

        // Set a timeout to cancel waiting if no response received
        timeoutId = setTimeout(() => {
          clearInterval(interval);
          reject(new Error('Timeout: No response from driver.'));
        }, timeOutResponseDriver); // Timeout after 30 seconds (adjust to your desired timeout value)
      });
    }
  }

  async sendDriverInfoToCustomer(customerId: number, payload: any) {
    const customerSocket = await this.gatewayBookingService.getCustomerSocketById(customerId);
    if (customerSocket && customerSocket.socketId) {
      this.server.to(customerSocket.socketId).emit('driverInfo', payload);
    }
  }
}
