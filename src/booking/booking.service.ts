import { Inject, Injectable } from '@nestjs/common';
import { PricingStrategyFactory } from 'src/pricing/pricing.factory';
import { UserService } from 'src/user/user.service';
import { GoogleMapsService } from 'src/shareModule/googleMap.service';
import { GatewayBookingService } from '../gateway-booking/gateway-booking.service';
import { GatewayBookingGateway } from '../gateway-booking/gateway-booking.gateway';
import { Repository } from 'typeorm';
import { Booking } from 'src/entities/booking.entity';
import { Route } from 'src/entities/route.entity';
import { Location } from 'src/entities/location.entity';
import { BookingPosition } from 'src/entities/bookingPosition.entity';
import { CreateBookingPostitionDto } from './dto/booking.dto';

@Injectable()
export class BookingService {


  getPrice(distanceInKm: number, vehicleType: string): number {
    throw new Error('Method not implemented.');
  }
  private pricingStrategyFactory: PricingStrategyFactory;

  constructor(
    pricingStrategyFactory: PricingStrategyFactory,
    private userService: UserService,
    private googleMapService: GoogleMapsService,
    // private gatewayBookingService: GatewayBookingService,
    // private gatewayBookingGateway: GatewayBookingGateway,
    @Inject('BOOKING_REPOSITORY')
    private readonly bookingRepository: Repository<Booking>, // private userService: UserService
    @Inject('ROUTE_REPOSITORY')
    private readonly routegRepository: Repository<Route>,
    @Inject('BOOKING_POSITION_REPOSITORY')
    private readonly bookingPositionRepository: Repository<BookingPosition>,
  ) {
    this.pricingStrategyFactory = pricingStrategyFactory;
  }

  async calculatePrice(
    distanceInKm: number,
    vehicleType: string,
  ): Promise<any> {
    const pricingStrategy = this.pricingStrategyFactory.createPricingStrategy();
    const price = pricingStrategy.calculatePrice(distanceInKm, vehicleType);
    return {
      statusCode: 200,
      price: price,
    };
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


  async getLocationByPhoneNumber(phoneNumber: string): Promise<any[]> {
    const bookings = await this.bookingRepository.createQueryBuilder("booking")
      .leftJoinAndSelect("booking.customer", "customer")
      .leftJoinAndSelect("customer.user", "user")
      .leftJoinAndSelect("booking.route", "route")
      .leftJoinAndSelect("route.endLocation2", "endLocation")
      .leftJoinAndSelect("route.startLocation2", "startLocation")
      // .leftJoinAndSelect("route.endLocation2", "endLocation")
      .select(["booking.bookingId", "route.routeId", "startLocation", "endLocation"])
      .where("user.phoneNumber = :phoneNumber", { phoneNumber: phoneNumber })
      .getMany();

    const location = bookings.map((booking) => {
      return {
        // bookingId: booking.bookingId,
        // routeId: booking.route.routeId,
        startLocation: booking.route.startLocation2,
        endLocation: booking.route.endLocation2,
      }
    }
    )
    return location;
  }

  async createBookingPostition(createBookingPostition: CreateBookingPostitionDto): Promise<any> {
    const newBookingPosition = new BookingPosition();
    const currentTime = new Date();

    // Định dạng thời gian hiện tại thành chuỗi DATETIME
    const formattedTime = currentTime.toISOString().slice(0, 19).replace('T', ' ');
    console.log('formattedTime', formattedTime);
    newBookingPosition.customerName = createBookingPostition.customerName;
    newBookingPosition.phoneNumber = createBookingPostition.phoneNumber;
    newBookingPosition.pickupAddress = createBookingPostition.pickupAddress;
    newBookingPosition.destAddress = createBookingPostition.destAddress;
    newBookingPosition.timeBooking = formattedTime;
    console.log('newBookingPosition', newBookingPosition);
    const savedBookingPosition = await this.bookingPositionRepository.save(newBookingPosition);
    return {
      statusCode: 200,
      message: 'Create Booking Position Successfully',
      bookingPosition: savedBookingPosition,
    }
  }

  async getBookingPositions(): Promise<any> {
    const bookingPositions = await this.bookingPositionRepository.find();
    bookingPositions.forEach((bookingPosition) => {
      delete bookingPosition.bookingPositionId;
      const dateTime = new Date(bookingPosition.timeBooking);
      // Lấy các thành phần của ngày và giờ
      const hours = dateTime.getHours();
      const minutes = dateTime.getMinutes();
      const seconds = dateTime.getSeconds();
      const day = dateTime.getDate();
      const month = dateTime.getMonth() + 1; // Tháng bắt đầu từ 0
      const year = dateTime.getFullYear();

      // Định dạng lại thành chuỗi theo yêu cầu
      const formattedDateTime = `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
      bookingPosition.timeBooking = formattedDateTime;
    })
    return {
      statusCode: 200,
      message: 'Get Booking Position Successfully',
      data: bookingPositions,
    }
  }

  //   // return 0;
  // }

  // async createBooking(body: any): Promise<any> {
  //   const { pickup, destination, vehicleType, paymentMethod } = body;
  //   const drivers = await this.userService.getDriversOnline();
  //   const customer = await this.getInforCustomer(+body.customerId);
  //   try {
  //     // find nearest driver
  //     const nearestDriver = await this.googleMapService.findNearestDriver(
  //       body.pickup,
  //       drivers,
  //     );
  //     // console.log("nearestDriver", nearestDriver);
  //     const driverSocket = await this.gatewayBookingService.getDriverSocketById(
  //       nearestDriver.driverId,
  //     );
  //     //send request book to the driver
  //     if (driverSocket) {
  //       this.gatewayBookingGateway.sendRideRequestToDriver(
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
