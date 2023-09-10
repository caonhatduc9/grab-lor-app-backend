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
import { DriverBooking } from 'src/entities/driverBooking.entity';
import { Booking } from 'src/entities/booking.entity';
import { Route } from 'src/entities/route.entity';
import { Location } from 'src/entities/location.entity';

@Injectable()
export class GatewayBookingService {
  // private server: Server;
  constructor(
    @Inject('SOCKET_DRIVER_REPOSITORY')
    private gatewayDriverRepository: Repository<SocketDriver>,
    @Inject('SOCKET_CUSTOMER_REPOSITORY')
    private driverBookingrRepository: Repository<DriverBooking>,
    @Inject('LOCATION_REPOSITORY')
    private locationRepository: Repository<Location>,
    @Inject('ROUTE_REPOSITORY')
    private routeRepository: Repository<Route>,
    @Inject('BOOKING_REPOSITORY')
    private bookingRepository: Repository<Booking>,
    @Inject('SOCKET_CUSTOMER_REPOSITORY')
    private readonly gatewayCustomerRepository: Repository<SocketCustomer>, // private userService: UserService
    private readonly userService: UserService,
    private googleMapService: GoogleMapsService,
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

  async getInforCustomer(customerId: number): Promise<any> {
    // console.log('customerId', customerId);
    const customer = await this.userService.getUserCustomerById(customerId);
    delete customer.password;
    delete customer.roleId;
    delete customer.authProvider;
    delete customer.customer;
    delete customer.isActive;
    delete customer.avatar;
    return customer;
  }

  async getInforCustomerByPhoneNumber(phoneNumber: string): Promise<any> {
    // console.log('customerId', customerId);
    const customer = await this.userService.getUserCustomerByPhoneNumber(phoneNumber);
    const customerId = customer.customer.customerId;
    delete customer.password;
    delete customer.roleId;
    delete customer.authProvider;
    delete customer.customer;
    delete customer.isActive;
    delete customer.avatar;
    customer.customerId = customerId;
    console.log("customerINFOR", customer);
    return customer;
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

  async findNearestDriverOnline(pickup: any): Promise<any> {
    const drivers = await this.userService.getDriversOnline();
    if (drivers.length === 0) return {
      statusCode: 404,
      message: 'No available driver found',
    };
    try {
      const nearestDriver = await this.googleMapService.findNearestDriver(
        pickup,
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

  async findListNearestDriversOnline(pickup: any, numberDriver: number): Promise<any> {
    const drivers = await this.userService.getDriversOnline();
    if (drivers.length === 0) return {
      statusCode: 404,
      message: 'No available driver found',
    };

    try {
      const nearestDrivers = await this.googleMapService.findNearestDrivers(
        pickup,
        drivers,
        numberDriver
      );

      return nearestDrivers;
    } catch (err) {
      console.error(`Error finding nearest drivers: ${err.message}`);
      return {
        statusCode: 404,
        message: 'No available driver found',
      };
    }
  }


  async findNearestDriverWithRetry(
    pickupCoordinates: { lat: number; lon: number },
    maxRetries: number = 2, // Số lần thử tối đa
  ): Promise<any> {
    let retryCount = 0;
    let nearestDriver;
    let initialNearestDrivers;

    while (retryCount < maxRetries) {
      try {
        if (!initialNearestDrivers) {
          initialNearestDrivers = await this.findListNearestDriversOnline(
            pickupCoordinates,
            maxRetries
          );
        }

        // Lọc danh sách tài xế để loại bỏ tài xế đã từ chối
        const remainingDrivers = initialNearestDrivers.filter(
          (driver) => !driver || driver.status !== 'rejected',
        );

        if (remainingDrivers.length === 0) {
          // Không còn tài xế nào khả dụng
          throw new Error('No available driver found');
        }

        nearestDriver = remainingDrivers[0]; // Lấy tài xế gần nhất từ danh sách còn lại

        // Kiểm tra nếu tài xế gần nhất chấp nhận hoặc không có lỗi
        if (!nearestDriver || nearestDriver.status === 'accepted') {
          break; // Thoát vòng lặp
        } else {
          // Tài xế từ chối, chuyển sang tài xế gần nhất tiếp theo
          retryCount++;
        }
      } catch (error) {
        // Xử lý lỗi tại đây (ví dụ: log lỗi)
        console.error(`Error finding nearest driver: ${error.message}`);
        retryCount++;
      }
    }

    // Kiểm tra nếu đã hết số lần thử và vẫn không có tài xế
    if (!nearestDriver && retryCount === maxRetries) {
      throw new Error('No available driver found after retries');
    }

    return nearestDriver;
  }



  async saveBooking(payload: any): Promise<any> {
    const newBooking = new Booking();
    const newRoute = new Route();
    const newStartLocation = new Location();
    const newEndLocation = new Location();

    newStartLocation.lat = payload.pickup.lat;
    newStartLocation.lon = payload.pickup.lon;
    const savedStartLocation = await this.locationRepository.save(newStartLocation);

    newEndLocation.lat = payload.pickup.lat;
    newEndLocation.lon = payload.pickup.lon;
    const savedEndLocation = await this.locationRepository.save(newEndLocation);

    newRoute.startLocation = savedStartLocation.locationId;
    newRoute.endLocation = savedEndLocation.locationId;
    newRoute.distance = payload.distance || null;
    const savedRoute = await this.routeRepository.save(newRoute);
    console.log("type", payload.vehicleType.toUpperCase());
    newBooking.routeId = savedRoute.routeId;
    newBooking.customerId = payload.customerId;
    newBooking.driverId = payload.driverId || null
    newBooking.typeVehicle = payload.vehicleType.toUpperCase();
    newBooking.charge = payload.price;
    newBooking.state = payload.state;
    newBooking.note = payload.note || null;
    newBooking.typeBooking = "APP"
    const savedBooking = await this.bookingRepository.save(newBooking);
    return savedBooking;
  }

  async saveBookingForWeb(payload: any): Promise<any> {
    console.log("checksavebooking", payload);
    const newBooking = new Booking();
    const newRoute = new Route();
    const newStartLocation = new Location();
    const newEndLocation = new Location();

    newStartLocation.lat = payload.pickup.lat;
    newStartLocation.lon = payload.pickup.lon;
    const savedStartLocation = await this.locationRepository.save(newStartLocation);

    newEndLocation.lat = payload.pickup.lat;
    newEndLocation.lon = payload.pickup.lon;
    const savedEndLocation = await this.locationRepository.save(newEndLocation);

    newBooking.customerId = payload.customerId;
    newRoute.startLocation = savedStartLocation.locationId;
    newRoute.endLocation = savedEndLocation.locationId;
    newRoute.distance = payload.distance || null;
    const savedRoute = await this.routeRepository.save(newRoute);
    console.log("type", payload.vehicleType.toUpperCase());
    newBooking.routeId = savedRoute.routeId;
    newBooking.customerId = payload.customerId;
    newBooking.driverId = payload.driverId || null
    newBooking.typeVehicle = payload.vehicleType.toUpperCase();
    newBooking.charge = payload.price || null
    newBooking.state = payload.state.toUpperCase() || null
    newBooking.note = payload.note || null;
    newBooking.typeBooking = "WEB";

    console.log("check214", newBooking);
    const savedBooking = await this.bookingRepository.save(newBooking);
    console.log("bookingID saved", savedBooking.bookingId);
    return savedBooking;
  }
  async updateBookingFields(bookingId: number, updateFields: Record<string, any>): Promise<any> {
    console.log("updateFields", updateFields, bookingId);
    const foundBooking = await this.bookingRepository.findOneBy({ bookingId });
    console.log("foundBooking", foundBooking);
    // Lặp qua các trường cần cập nhật và áp dụng chúng vào foundBooking
    for (const field in updateFields) {
      if (updateFields.hasOwnProperty(field)) {
        foundBooking[field] = updateFields[field];
      }
    }
    return await this.bookingRepository.save(foundBooking);
  }

}
