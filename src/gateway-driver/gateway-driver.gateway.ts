import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { GatewayDriverService } from './gateway-driver.service';
import { CreateGatewayDriverDto } from './dto/create-gateway-driver.dto';
import { UpdateGatewayDriverDto } from './dto/update-gateway-driver.dto';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway()
export class GatewayDriverGateway {
  constructor(private readonly gatewayDriverService: GatewayDriverService) { }

  @WebSocketServer() server: Server;
  handleConnection(client: Socket) {
    const driverId = client.handshake.query.driverId as string;
    if (client.handshake.query.driverId) {
      const driverId = client.handshake.query.driverId as string;
      console.log(client.handshake.query); // Lấy thông tin từ query string
      if (driverId) {
        console.log("====driver", client.id);
        this.gatewayDriverService.addDriverSocket(driverId, client.id);
      }
      console.log('Client connected: ' + client.id);
      // this.gatewayDriverService.getDriverSocketById(2)
    }
    if (client.handshake.query.customerId) {
      const customerId = client.handshake.query.customerId as string;
      console.log("====customer", client.id);
      this.gatewayDriverService.addCustomerSocket(customerId, client.id);
    }
  }

  // Xử lý sự kiện khi tài xế ngắt kết nối
  handleDisconnect(client: Socket) {
    if (client.handshake.query.driverId) {
      const driverId = client.handshake.query.driverId as string;
      if (driverId) {
        this.gatewayDriverService.removeDriverSocket(+driverId);
      }
    }
    if (client.handshake.query.customerId) {
      const customerId = client.handshake.query.customerId as string;
      this.gatewayDriverService.removeCustomerSocket(+customerId);
    }
  }

  @SubscribeMessage('rideResponse')
  handleRideResponse(client: Socket, response: any) {
    // Forward phản hồi từ tài xế tới phía client (app customer)
    this.server.to(response.customerSocketId).emit('rideResponse', {
      statusCode: response.accepted ? 200 : 200, // Tùy tình huống, bạn có thể đổi statusCode tại đây
      message: response.accepted ? 'Driver accepted' : 'Driver declined',
    });
  }

  async sendRideRequestToDriver(driverId: string, payload: any) {
    const socket = await this.gatewayDriverService.getDriverSocketById(+driverId);
    const socketId = socket.socketId;
    if (socketId) {
      console.log("===CHECK===", socket.socketId);
      this.server.to(socket.socketId).emit('rideRequest', payload);
    }
  }
  async sendDriverInfoToCustomer(driverInfo: any) {
    const customerSocket = await this.gatewayDriverService.getCustomerSocketById(driverInfo.customerSocketId);

    if (customerSocket.socketId) {
      this.server.to(customerSocket.socketId).emit('driverInfo', driverInfo);
    }
  }
}
