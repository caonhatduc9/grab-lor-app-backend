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
  async handleUpdateLocationDriver(client: Socket, payload: any) {
    console.log('====updateLocation', payload);
    const driverId = client.handshake.query.driverId as string;
    const res = await this.gatewayBookingService.updateLocationDriver(
      +driverId,
      payload,
    );
    console.log('====updateLocation', res);
    this.server.emit('updateLocationDriver', res);
  }

  @SubscribeMessage('driverResponse')
  handleDriverResponse(client: Socket, payload: any) {
    const driverId = client.id; // Thay thế bằng trường dữ liệu chứa ID của tài xế
    this.driverResponses.set(client.id, payload.status);
    console.log("map", this.driverResponses);
    this.server.emit('driverResponse', {
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
          this.sendDriverInfoToCustomer({
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
            this.sendDriverInfoToCustomer({
              statusCode: 200,
              message: 'accepted',
              driverInfo: nearestDriver,
            });
          }
        } else {
          this.sendDriverInfoToCustomer({ message: 'Driver not available' });
        }
      } catch (error) {
        this.sendDriverInfoToCustomer({
          statusCode: 404,
          message: 'No available driver found',
        });
      }
    } catch (error) {
      this.sendDriverInfoToCustomer({
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
  async sendDriverInfoToCustomer(driverInfo: any) {
    const customerSocket =
      await this.gatewayBookingService.getCustomerSocketById(
        driverInfo.customerSocketId,
      );
    if (customerSocket.socketId) {
      this.server.to(customerSocket.socketId).emit('driverInfo', driverInfo);
    }
  }
}
