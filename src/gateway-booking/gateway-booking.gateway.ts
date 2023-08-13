import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { GatewayBookingService } from './gateway-booking.service';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { BookingService } from '../booking/booking.service';
import { UserService } from '../user/user.service';
import { async } from 'rxjs';
import { UpdateLocationDto } from './dto/updateLocation.dto';

@Injectable()
@WebSocketGateway()
export class GatewayBookingGateway {
  private driverResponses: Map<string, any>;
  constructor(
    private readonly gatewayBookingService: GatewayBookingService,
    private readonly bookingService: BookingService,
    private readonly userServide: UserService,
  ) {
    this.driverResponses = new Map<string, any>();
  }

  @WebSocketServer() server: Server;
  handleConnection(client: Socket) {
    const driverId = client.handshake.query.driverId as string;
    if (client.handshake.query.driverId) {
      const driverId = client.handshake.query.driverId as string;
      console.log(client.handshake.query); // Lấy thông tin từ query string
      if (driverId) {
        console.log('====driver', client.id);
        this.gatewayBookingService.addDriverSocket(+driverId, client.id);
        this.userServide.updateStatusDriver(+driverId, 'online');
      }
      console.log('Client connected: ' + client.id);
      // this.gatewayDriverService.getDriverSocketById(2)
    }
    if (client.handshake.query.customerId) {
      const customerId = client.handshake.query.customerId as string;
      console.log('====customer', client.id);
      this.gatewayBookingService.addCustomerSocket(+customerId, client.id);
    }
  }

  // Xử lý sự kiện khi tài xế ngắt kết nối
  handleDisconnect(client: Socket) {
    if (client.handshake.query.driverId) {
      const driverId = client.handshake.query.driverId as string;
      if (driverId) {
        this.gatewayBookingService.removeDriverSocket(+driverId);
      }
    }
    if (client.handshake.query.customerId) {
      const customerId = client.handshake.query.customerId as string;
      this.gatewayBookingService.removeCustomerSocket(+customerId);
    }
  }


  @SubscribeMessage('updateLocationDriver')
  async handleUpdateLocationDriver(client: Socket, payload: UpdateLocationDto) {
    console.log('====updateLocation1', payload, "driverId::", client.handshake.query.driverId, "client.id::", client.id);
    const driverId = client.handshake.query.driverId as string;
    const res = await this.gatewayBookingService.updateLocationDriver(
      +driverId,
      payload,
    );

    console.log('====updateLocation', res);
    const driverSocket = await this.gatewayBookingService.getDriverSocketById(+driverId);
    this.server.to(driverSocket.socketId).emit('updateLocationDriver', res);
    return res;
  }

  @SubscribeMessage('driverResponse')
  async handleDriverResponse(client: Socket, payload: any) {
    const driverId = client.handshake.query.driverId as string;
    this.driverResponses.set(client.id, payload.status);
    console.log("map", this.driverResponses.entries());
    const driverSocket = await this.gatewayBookingService.getDriverSocketById(+driverId);
    console.log("ceheck", driverSocket.socketId);
    this.server.to(driverSocket.socketId).emit('driverResponse', {
      statusCode: 200,
      message: 'accepted',
    });
  }

  @SubscribeMessage('createBooking')
  async handleCreateBooking(client: Socket, payload: any) {
    try {
      const { pickup, destination, vehicleType, paymentMethod } = payload;
      const customer = await this.bookingService.getInforCustomer(+payload.customerId);
      try {
        // find nearest driverSocket
        const nearestDriver = await this.gatewayBookingService.findNearestDriverOnline(payload);
        if (nearestDriver.statusCode === 404) {
          this.sendDriverInfoToCustomer(payload.customerId, {
            statusCode: 404,
            message: 'all driver not available please try again later',
          });
          return;
        }
        const driverSocket = await this.gatewayBookingService.getDriverSocketById(
          nearestDriver.driverId,
        );
        console.log('driverSocket', driverSocket);

        //send request book to the driver
        const driverResponsePromise = new Promise((resolve) => {
          this.sendRideRequestToDriver(
            nearestDriver.driverId,
            { customer, pickup, destination, vehicleType, paymentMethod },
          );
          const interval = setInterval(() => {
            if (this.driverResponses.has(driverSocket.socketId)) {
              clearInterval(interval);
              resolve(this.driverResponses.get(driverSocket.socketId));
            }
          }, 1000);
        });

        if (driverSocket) {
          console.log("====driverSocket", driverSocket);
          const driverResponse = await driverResponsePromise;

          console.log("====driverResponses", driverResponse, this.driverResponses.get(driverSocket.socketId));
          if (this.driverResponses.get(driverSocket.socketId) === 'accept') {
            this.userServide.updateStatusDriver(+nearestDriver.driverId, 'driving');
            this.driverResponses.delete(driverSocket.socketId);
            this.sendDriverInfoToCustomer(payload.customerId, {
              statusCode: 200,
              message: 'accepted',
              driverInfo: nearestDriver,
            });
          }
        } else {
          this.sendDriverInfoToCustomer(payload.customerId, { message: 'Driver not available' });
        }
      } catch (error) {
        this.sendDriverInfoToCustomer(payload.customerId, {
          statusCode: 404,
          message: 'No available driver found',
        });
      }
    } catch (error) {
      this.sendDriverInfoToCustomer(payload.customerId, {
        statusCode: 500,
        message: 'Error requesting ride',
      });
    }
  }
  async sendRideRequestToDriver(driverId: string, payload: any) {
    const socket = await this.gatewayBookingService.getDriverSocketById(
      +driverId,
    );
    const socketId = socket.socketId;
    if (socketId) {
      console.log('===CHECK===', socket.socketId);
      this.server.to(socket.socketId).emit('rideRequest', payload);
    }
  }
  async sendDriverInfoToCustomer(customerId, payload: any) {
    const customerSocket =
      await this.gatewayBookingService.getCustomerSocketById(
        customerId
      );
    if (customerSocket.socketId) {
      this.server.to(customerSocket.socketId).emit('driverInfo', payload);
    }
  }
}
