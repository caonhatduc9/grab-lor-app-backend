// createBookingJob.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { GatewayBookingService } from '../gateway-booking.service'
import { GatewayBookingGateway } from '../gateway-booking.gateway';
import { UserService } from 'src/user/user.service';
// import { UpdateLocationDto } from './dto/updateLocation.dto';

@Processor('createBooking')
export class CreateBookingProcessor {
    constructor(private readonly gatewayBookingService: GatewayBookingService,
        private gatewayBookingGateway: GatewayBookingGateway,
        // private readonly gatewayBookingService: GatewayBookingService,
        private readonly userService: UserService,
    ) { }

    @Process('createBooking')
    async handleCreateBooking(job: Job<any>) {
        const payload = job.data;
        if (payload && payload.customerId) {
            try {
                const { customerId, pickup, destination, vehicleType, price, paymentMethod } = payload;
                const customer = await this.gatewayBookingService.getInforCustomer(+payload.customerId);
                const nearestDriver = await this.gatewayBookingService.findNearestDriverOnline(pickup);
                const driverId = nearestDriver.driverId;

                if (nearestDriver.statusCode === 404) {
                    this.gatewayBookingGateway.sendDriverInfoToCustomer(+payload.customerId, {
                        statusCode: 404,
                        message: 'No available driver found, please try again later',
                    });
                    return;
                }
                try {
                    const driverSocket = await this.gatewayBookingService.getDriverSocketById(nearestDriver.driverId);

                    if (driverSocket) {
                        const driverResponse = await this.gatewayBookingGateway.sendRideRequestToDriver(
                            nearestDriver.driverId,
                            { customer, pickup, destination, vehicleType, price, paymentMethod, customerId },
                        );

                        if (driverResponse === 'accept') {
                            const state = "CONFIRMED";
                            this.gatewayBookingService.saveBooking({ ...payload, driverId, state });
                            this.userService.updateStatusDriver(+nearestDriver.driverId, 'driving');
                            this.gatewayBookingGateway.sendDriverInfoToCustomer(+customerId, {
                                statusCode: 200,
                                message: 'accepted',
                                driverInfo: nearestDriver,
                            });
                        }
                    } else {
                        //tai xe tu choi cuoc xe
                        // this.sendDriverInfoToCustomer(+customerId, { message: 'Driver not available' });
                    }
                } catch (error) {
                    console.log("Failed to send driver info", error);
                    //cho nay can danh dau tai xe da bỏ qua cuoc xe 
                }
            } catch (error) {
                this.gatewayBookingGateway.sendDriverInfoToCustomer(payload.customerId, {
                    statusCode: 500,
                    message: 'Error requesting ride',
                });
            }

            // const result = await this.gatewayBookingService.handleCreateBooking(payload);
            // return result;
        }
        else {
            console.log("Create Booking web in run background ", payload);
            let state: string;
            //sua lai customer id cho nay khong co cuitomer id
            const customer = await this.gatewayBookingService.getInforCustomerByPhoneNumber(payload.phoneNumber);
            console.log("Customer", customer);
            const customerId = customer.customerId;
            state = "FINDING"
            const { bookingId } = await this.gatewayBookingService.saveBookingForWeb({ ...payload, customerId, state });
            try {
                console.log("BookingID", bookingId);
                const { pickup, destination, vehicleType, price, paymentMethod } = payload;
                console.log("cútomer", customer);
                const nearestDriver = await this.gatewayBookingService.findNearestDriverOnline(pickup);
                console.log("nearest driver", nearestDriver);
                if (nearestDriver.statusCode === 404) {
                    state = "NOTFOUND";
                    this.gatewayBookingService.updateBookingstatus(bookingId, state);
                    return {
                        statusCode: 404,
                        message: 'No available driver found, please try again later',
                    };
                }
                try {
                    const driverSocket = await this.gatewayBookingService.getDriverSocketById(nearestDriver.driverId);

                    if (driverSocket) {
                        console.log("checking", driverSocket);
                        const driverResponse = await this.gatewayBookingGateway.sendRideRequestToDriver(
                            nearestDriver.driverId,
                            { customer, pickup, destination, vehicleType, price, paymentMethod },
                        );

                        if (driverResponse === 'accept') {
                            state = 'TRANSITING';
                            this.gatewayBookingService.updateBookingstatus(bookingId, state)
                            // this.userService.updateStatusDriver(+nearestDriver.driverId, 'driving');
                            // this.gatewayBookingGateway.sendDriverInfoToCustomer(+customerId, {
                            //   statusCode: 200,
                            //   message: 'accepted',
                            //   driverInfo: nearestDriver,
                            // });
                            return {
                                statusCode: 200,
                                message: 'accepted',
                                driverInfo: nearestDriver,
                            }
                        }
                    } else {
                        //tai xe tu choi cuoc xe
                        // this.sendDriverInfoToCustomer(+customerId, { message: 'Driver not available' });
                        state = 'NOTFOUND';
                        this.gatewayBookingService.updateBookingstatus(bookingId, state)
                        return {
                            statusCode: 400,
                            message: 'Driver not available',
                            driverInfo: nearestDriver,
                        }
                    }
                } catch (error) {
                    console.log("Failed to send driver info", error);
                    //cho nay can danh dau tai xe da bỏ qua cuoc xe 
                    state = 'NOTFOUND';
                    this.gatewayBookingService.updateBookingstatus(bookingId, state)
                    return {
                        statusCode: 400,
                        message: 'Driver not available',
                        driverInfo: nearestDriver,
                    }
                }
            } catch (error) {
                console.log("Failed to handle request: ", error);
                //   this.gatewayBookingGateway.sendDriverInfoToCustomer(payload.customerId, {
                //     statusCode: 500,
                //     message: 'Error requesting ride',
                //   });
            }
        }
    }
}
