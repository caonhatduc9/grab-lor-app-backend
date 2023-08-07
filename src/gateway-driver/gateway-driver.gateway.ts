import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { GatewayDriverService } from './gateway-driver.service';
import { CreateGatewayDriverDto } from './dto/create-gateway-driver.dto';
import { UpdateGatewayDriverDto } from './dto/update-gateway-driver.dto';
import { Server } from 'socket.io';

@WebSocketGateway()
export class GatewayDriverGateway {
  constructor(private readonly gatewayDriverService: GatewayDriverService) { }

  @WebSocketServer() server: Server;

  @SubscribeMessage('setDriverStatus')
  handleSetDriverStatus(client: any, data: { latitude: number, longitude: number, isAvailable: boolean }) {
    // Cập nhật vị trí và trạng thái của tài xế vào cơ sở dữ liệu
    // Code cập nhật cơ sở dữ liệu ở đây
    console.log('Thông tin tài xế:', data);

    // Gửi thông báo tới tài xế rằng đã thiết lập kết nối thành công
    client.emit('connected', { message: 'Kết nối thành công!' });
  }

  @SubscribeMessage('createGatewayDriver')
  create(@MessageBody() createGatewayDriverDto: CreateGatewayDriverDto) {
    return this.gatewayDriverService.create(createGatewayDriverDto);
  }

  @SubscribeMessage('findAllGatewayDriver')
  findAll() {
    return this.gatewayDriverService.findAll();
  }

  @SubscribeMessage('findOneGatewayDriver')
  findOne(@MessageBody() id: number) {
    return this.gatewayDriverService.findOne(id);
  }

  @SubscribeMessage('updateGatewayDriver')
  update(@MessageBody() updateGatewayDriverDto: UpdateGatewayDriverDto) {
    return this.gatewayDriverService.update(updateGatewayDriverDto.id, updateGatewayDriverDto);
  }

  @SubscribeMessage('removeGatewayDriver')
  remove(@MessageBody() id: number) {
    return this.gatewayDriverService.remove(id);
  }
}
