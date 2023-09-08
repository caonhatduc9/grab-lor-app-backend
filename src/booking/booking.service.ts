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
      .select(["booking.bookingId", "route.routeId", "startLocation", "endLocation"])
      .where("user.phoneNumber = :phoneNumber", { phoneNumber: phoneNumber })
      .getMany();

    const location = bookings.map((booking) => {
      delete booking.route.startLocation2.locationId
      delete booking.route.endLocation2.locationId
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
    try {
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
    const bookingPositions = await this.bookingPositionRepository.find();
    bookingPositions.forEach((bookingPosition) => {
      // delete bookingPosition.bookingPositionId;
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

  async getBookingPositionByPhoneNumber(phoneNumber: string): Promise<any> {
    const bookingPositions = await this.bookingPositionRepository.findBy({ phoneNumber: phoneNumber });
    console.log("booking", bookingPositions);
    bookingPositions.forEach((bookingPosition) => {
      // delete bookingPosition.bookingPositionId;
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
  async getBookingPositionById(id: number): Promise<any> {
    const bookingPosition = await this.bookingPositionRepository.findOneBy({ bookingPositionId: id });

    // delete bookingPosition.bookingPositionId;
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
    return {
      statusCode: 200,
      message: 'Get Booking Position Successfully',
      data: bookingPosition,
    }
  }

  async createBooking(payload: any): Promise<any> {
    console.log("Create Booking web", payload);
    await this.createBookingQueue.add('createBooking', payload, {
      removeOnComplete: false,
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
      .select(["booking.bookingId", "customer.customerId", "user.phoneNumber", "user.username", "route.routeId", "startLocation", "endLocation"])
      .where("booking.typeBooking = :typeBooking", { typeBooking: "WEB" })
      .getMany();
    const formatedBooking = bookings.map((booking) => {
      delete booking.route.startLocation2.locationId
      delete booking.route.endLocation2.locationId
      return {
        // bookingId: booking.bookingId,
        // routeId: booking.route.routeId,
        phoneNumber: booking.customer.user.phoneNumber,
        username: booking.customer.user.username,
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


