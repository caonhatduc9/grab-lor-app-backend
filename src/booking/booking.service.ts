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
import { STATUS_CODES } from 'http';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

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
    private gatewayBookingService: GatewayBookingService,
    private gatewayBookingGateway: GatewayBookingGateway,
    @InjectQueue('createBooking') private createBookingQueue: Queue,
    // private gatewayBookingGateway: GatewayBookingGateway,
    @Inject('BOOKING_REPOSITORY')
    private readonly bookingRepository: Repository<Booking>, // private userService: UserService,
    @Inject('LOCATION_REPOSITORY')
    private locationRepository: Repository<Location>,
    @Inject('ROUTE_REPOSITORY')
    private readonly routeRepository: Repository<Route>,
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




  async getLocationByPhoneNumber(phoneNumber: string): Promise<any[]> {
    const bookings = await this.bookingRepository.createQueryBuilder("booking")
      .leftJoinAndSelect("booking.customer", "customer")
      .leftJoinAndSelect("customer.user", "user")
      .leftJoinAndSelect("booking.route", "route")
      .leftJoinAndSelect("route.endLocation2", "endLocation")
      .leftJoinAndSelect("route.startLocation2", "startLocation")
      // .leftJoinAndSelect("route.endLocation2", "endLocation")
      .select(["booking.bookingId", "route.routeId", "route.timePickup", "startLocation", "endLocation"])
      .where("user.phoneNumber = :phoneNumber", { phoneNumber: phoneNumber })
      .getMany();

    const location = bookings.map((booking) => {
      delete booking.route.startLocation2.locationId
      delete booking.route.endLocation2.locationId

      const dateTime = new Date(booking.route.timePickup);
      // Lấy các thành phần của ngày và giờ
      const hours = dateTime.getHours();
      const minutes = dateTime.getMinutes();
      const seconds = dateTime.getSeconds();
      const day = dateTime.getDate();
      const month = dateTime.getMonth() + 1; // Tháng bắt đầu từ 0
      const year = dateTime.getFullYear();

      // Định dạng lại thành chuỗi theo yêu cầu
      const formattedDateTime = `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;

      return {
        // bookingId: booking.bookingId,
        // routeId: booking.route.routeId,
        timePickup: formattedDateTime,
        startLocation: booking.route.startLocation2,
        endLocation: booking.route.endLocation2,
      }
    }
    )
    return location;
  }

  async createBookingPostition(createBookingPostition: CreateBookingPostitionDto): Promise<any> {
    try {
      console.log("createBookingPostition", createBookingPostition);
      const newBookingPosition = new BookingPosition();
      const currentTime = new Date();
      const { phoneNumber, customerName } = createBookingPostition;
      const foundCustomer = await this.userService.getUserCustomerByPhoneNumber(phoneNumber);
      if (foundCustomer) {
        newBookingPosition.customerId = foundCustomer.customer.customerId;
      }
      else {
        const savedCustomer = await this.userService.createCustomerForWeb({ phoneNumber, customerName })
        newBookingPosition.customerId = savedCustomer.customerId;
      }
      // Định dạng thời gian hiện tại thành chuỗi DATETIME
      const formattedTime = currentTime.toISOString().slice(0, 19).replace('T', ' ');
      console.log('formattedTime', formattedTime);
      newBookingPosition.phoneNumber = createBookingPostition.phoneNumber;
      newBookingPosition.pickupAddress = createBookingPostition.pickupAddress;
      newBookingPosition.destAddress = createBookingPostition.destAddress;
      newBookingPosition.timeBooking = formattedTime;
      newBookingPosition.typeVehicle = createBookingPostition.vehicleType.toUpperCase() as 'CAR' | 'MOTORBIKE';
      console.log('newBookingPosition', newBookingPosition);
      const savedBookingPosition = await this.bookingPositionRepository.save(newBookingPosition);
      return {
        statusCode: 200,
        message: 'Create Booking Position Successfully',
        bookingPosition: savedBookingPosition,
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Create Booking Position Failed',
        error: error,
      }
    }
  }
  async getBookingPositions(): Promise<any> {
    const bookingPositions = await this.bookingPositionRepository.createQueryBuilder('bookingPosition')
      .leftJoinAndSelect('bookingPosition.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'user')
      .getMany();

    const convertedPositions = [];

    for (const position of bookingPositions) {
      const user = position.customer.user;
      const dateTime = new Date(position.timeBooking);
      // Lấy các thành phần của ngày và giờ
      const hours = dateTime.getHours();
      const minutes = dateTime.getMinutes();
      const seconds = dateTime.getSeconds();
      const day = dateTime.getDate();
      const month = dateTime.getMonth() + 1; // Tháng bắt đầu từ 0
      const year = dateTime.getFullYear();

      // Định dạng lại thành chuỗi theo yêu cầu
      const formattedDateTime = `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
      const convertedPosition = {
        bookingPositionsId: position.bookingPositionId,
        phoneNumber: position.phoneNumber,
        pickupAddress: position.pickupAddress,
        destAddress: position.destAddress,
        timeBooking: formattedDateTime,
        vehicleType: position.typeVehicle.toLowerCase(),
        customerName: user.username
      };
      convertedPositions.push(convertedPosition);
    }

    // bookingPositions.forEach((bookingPosition) => {
    //   // delete bookingPosition.bookingPositionId;
    //   const dateTime = new Date(bookingPosition.timeBooking);
    //   // Lấy các thành phần của ngày và giờ
    //   const hours = dateTime.getHours();
    //   const minutes = dateTime.getMinutes();
    //   const seconds = dateTime.getSeconds();
    //   const day = dateTime.getDate();
    //   const month = dateTime.getMonth() + 1; // Tháng bắt đầu từ 0
    //   const year = dateTime.getFullYear();

    //   // Định dạng lại thành chuỗi theo yêu cầu
    //   const formattedDateTime = `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    //   bookingPosition.timeBooking = formattedDateTime;
    // bookingPosition.customerName = bookingPosition.customer.user.username
    // })
    return {
      statusCode: 200,
      message: 'Get Booking Position Successfully',
      data: convertedPositions,
    }
  }

  async getBookingPositionByPhoneNumber(phoneNumber: string): Promise<any> {
    const bookingPositions = await this.bookingPositionRepository.createQueryBuilder('bookingPosition')
      .leftJoinAndSelect('bookingPosition.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'user')
      .where('bookingPosition.phoneNumber =:phoneNumber', { phoneNumber: phoneNumber })
      .getMany();
    console.log("booking", bookingPositions);
    // bookingPositions.forEach((bookingPosition) => {
    //   // delete bookingPosition.bookingPositionId;
    //   const dateTime = new Date(bookingPosition.timeBooking);
    //   // Lấy các thành phần của ngày và giờ
    //   const hours = dateTime.getHours();
    //   const minutes = dateTime.getMinutes();
    //   const seconds = dateTime.getSeconds();
    //   const day = dateTime.getDate();
    //   const month = dateTime.getMonth() + 1; // Tháng bắt đầu từ 0
    //   const year = dateTime.getFullYear();
    //   // Định dạng lại thành chuỗi theo yêu cầu
    //   const formattedDateTime = `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    //   bookingPosition.timeBooking = formattedDateTime;
    // })
    const convertedPositions = [];

    for (const position of bookingPositions) {
      const user = position.customer.user;
      const dateTime = new Date(position.timeBooking);
      // Lấy các thành phần của ngày và giờ
      const hours = dateTime.getHours();
      const minutes = dateTime.getMinutes();
      const seconds = dateTime.getSeconds();
      const day = dateTime.getDate();
      const month = dateTime.getMonth() + 1; // Tháng bắt đầu từ 0
      const year = dateTime.getFullYear();

      // Định dạng lại thành chuỗi theo yêu cầu
      const formattedDateTime = `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
      const convertedPosition = {
        bookingPositionsId: position.bookingPositionId,
        phoneNumber: position.phoneNumber,
        pickupAddress: position.pickupAddress,
        destAddress: position.destAddress,
        timeBooking: formattedDateTime,
        vehicleType: position.typeVehicle.toLocaleLowerCase(),
        customerName: user.username
      };
      convertedPositions.push(convertedPosition);
    }
    return {
      statusCode: 200,
      message: 'Get Booking Position Successfully',
      data: convertedPositions,
    }
  }
  async getBookingPositionById(id: number): Promise<any> {
    const position = await this.bookingPositionRepository.createQueryBuilder('bookingPosition')
      .leftJoinAndSelect('bookingPosition.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'user')
      .where('bookingPosition.bookingPositionId =:id', { 'id': id })
      .getOne();

    // delete bookingPosition.bookingPositionId;
    const user = position.customer.user;
    const dateTime = new Date(position.timeBooking);
    // Lấy các thành phần của ngày và giờ
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    const seconds = dateTime.getSeconds();
    const day = dateTime.getDate();
    const month = dateTime.getMonth() + 1; // Tháng bắt đầu từ 0
    const year = dateTime.getFullYear();

    // Định dạng lại thành chuỗi theo yêu cầu
    const formattedDateTime = `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    const convertedPosition = {
      phoneNumber: position.phoneNumber,
      pickupAddress: position.pickupAddress,
      destAddress: position.destAddress,
      timeBooking: formattedDateTime,
      vehicleType: position.typeVehicle.toLocaleLowerCase(),
      customerName: user.username
    };
    return {
      statusCode: 200,
      message: 'Get Booking Position Successfully',
      data: convertedPosition,
    }
  }

  async createBooking(payload: any): Promise<any> {
    console.log("Create Booking web", payload);
    await this.createBookingQueue.add('createBooking', payload, {
      removeOnComplete: true,
    });
    return {
      statusCode: 200,
      message: 'Create Booking Successfully',
      // bookingId: bookingId,
    }
  }

  async getBookings(): Promise<any> {
    const bookings = await this.bookingRepository.createQueryBuilder("booking")
      .leftJoinAndSelect("booking.customer", "customer")
      .leftJoinAndSelect("customer.user", "user")
      .leftJoinAndSelect("booking.route", "route")
      .leftJoinAndSelect("route.endLocation2", "endLocation")
      .leftJoinAndSelect("route.startLocation2", "startLocation")
      .select(["booking.bookingId", "booking.state", "customer.customerId", "user.phoneNumber", "user.username", "route.routeId","route.timePickup", "startLocation", "endLocation"])
      .where("booking.typeBooking = :typeBooking", { typeBooking: "WEB" })
      .getMany();
    const formatedBooking = bookings.map((booking) => {
      delete booking.route.startLocation2.locationId
      delete booking.route.endLocation2.locationId
      const dateTime = new Date(booking.route.timePickup);
      // Lấy các thành phần của ngày và giờ
      const hours = dateTime.getHours();
      const minutes = dateTime.getMinutes();
      const seconds = dateTime.getSeconds();
      const day = dateTime.getDate();
      const month = dateTime.getMonth() + 1; // Tháng bắt đầu từ 0
      const year = dateTime.getFullYear();

      // Định dạng lại thành chuỗi theo yêu cầu
      const formattedDateTime = `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
      return {
        // bookingId: booking.bookingId,
        // routeId: booking.route.routeId,
        phoneNumber: booking.customer.user.phoneNumber,
        username: booking.customer.user.username,
        status: booking.state.toLocaleLowerCase(),
        timePickup: formattedDateTime,
        startLocation: booking.route.startLocation2,
        endLocation: booking.route.endLocation2,
      }
    }
    )

    return {
      statusCode: 200,
      message: 'Get Bookings Successfully',
      data: formatedBooking,
    }
  }

}


