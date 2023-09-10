// createBookingJob.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { GatewayBookingService } from '../gateway-booking.service'
import { GatewayBookingGateway } from '../gateway-booking.gateway';
import { UserService } from 'src/user/user.service';
import { ConnectionCheckOutStartedEvent } from 'typeorm';
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
        let state: string;

        if (payload && payload.customerId) {
            const { customerId, pickup, destination, vehicleType, price, paymentMethod } = payload;
            const maxRetries = 2;
            let retryCount = 0;
            let nearestDriver;
            state = "FINDING";

            const savedBooking = await this.gatewayBookingService.saveBooking({ ...payload, state });
            const listNearestDriver = await this.gatewayBookingService.findListNearestDriversOnline(pickup, maxRetries);
            console.log(" list ", listNearestDriver);
            // return 0;
            if (listNearestDriver.length === 0) {
                this.gatewayBookingGateway.sendDriverInfoToCustomer(+payload.customerId, {
                    statusCode: 404,
                    message: 'No available driver found, please try again later',
                });
                return;
            }
            const customer = await this.gatewayBookingService.getInforCustomer(+payload.customerId);
            while (retryCount < maxRetries) {
                console.log("retry count", retryCount);
                try {
                    // const driverId = nearestDriver.driverId;

                    // try {
                    // const remainingDrivers = listNearestDriver.filter(
                    //     (driver: any) => !driver || driver.status !== 'reject',
                    // );
                    listNearestDriver.forEach((driver, index) => {
                        if (driver && driver.status === 'reject') {
                            listNearestDriver.splice(index, 1);
                        }
                    });
                    console.log("list nearest driver", listNearestDriver);
                    if (listNearestDriver.length === 0) {
                        this.gatewayBookingGateway.sendDriverInfoToCustomer(+payload.customerId, {
                            statusCode: 404,
                            message: 'No available driver found, please try again later',
                        });
                        return;
                    }
                    nearestDriver = listNearestDriver[0];
                    const driverSocket = await this.gatewayBookingService.getDriverSocketById(nearestDriver.driverId);

                    if (driverSocket) {
                        const bookingId = savedBooking.bookingId;
                        let driverResponse;
                        try {
                            driverResponse = await this.gatewayBookingGateway.sendRideRequestToDriver(
                                nearestDriver.driverId,
                                { bookingId, customer, pickup, destination, vehicleType, price, paymentMethod, customerId },
                            );
                        } catch (error) {
                            console.log("time out driver response");
                            console.log("check reject");
                            listNearestDriver[0].status = 'reject';
                            // this.userService.updateStatusDriver(+nearestDriver.driverId, 'online');
                            retryCount++;
                            // continue;
                        }

                        if (driverResponse === 'accept') {

                            const updateFields = {
                                driverId: nearestDriver.driverId,
                                state: 'TRANSITING',
                            };
                            // ConnectionCheckOutStartedEvent
                            // const state = "TRANSITING";
                            const bookingId = savedBooking.bookingId;
                            this.gatewayBookingService.updateBookingFields(bookingId, updateFields);
                            this.userService.updateStatusDriver(+nearestDriver.driverId, 'driving');
                            this.gatewayBookingGateway.sendDriverInfoToCustomer(+customerId, {
                                statusCode: 200,
                                message: 'accepted',
                                driverInfo: nearestDriver,
                            });
                            break;
                        }
                        else if (driverResponse === 'reject') {
                            console.log("check reject");
                            listNearestDriver[0].status = 'reject';
                            // this.userService.updateStatusDriver(+nearestDriver.driverId, 'online');
                            retryCount++;
                        }
                        // else if (driverResponse === 'timeout') {
                        //     const state = "NOTFOUND";
                        //     this.gatewayBookingService.saveBooking({ ...payload, driverId, state });
                        //     this.gatewayBookingGateway.sendDriverInfoToCustomer(+customerId, {
                        //         statusCode: 404,
                        //         message: 'No available driver found, please try again later',
                        //     });
                        //     break;
                        // }
                    } else {
                        //tai xe tu choi cuoc xe
                        // this.sendDriverInfoToCustomer(+customerId, { message: 'Driver not available' });
                    }
                    // } catch (error) {
                    //     console.log("Failed to send driver info", error);
                    //     //cho nay can danh dau tai xe da bỏ qua cuoc xe 
                    // }
                } catch (error) {
                    console.error(`Error finding nearest driver: ${error.message}`);
                    retryCount++;

                    // this.gatewayBookingGateway.sendDriverInfoToCustomer(payload.customerId, {
                    //     statusCode: 500,
                    //     message: 'Error requesting ride',
                    // });
                }
                if (retryCount === maxRetries) {
                    const updateFields = {
                        state: 'NOTFOUND',
                    };
                    const bookingId = savedBooking.bookingId;
                    this.gatewayBookingService.updateBookingFields(+bookingId, updateFields)
                    this.gatewayBookingGateway.sendDriverInfoToCustomer(payload.customerId, {
                        statusCode: 404,
                        message: 'all driver are busy',
                    });
                    // throw new Error('No available driver found after retries');
                }
            }
            console.log("end");
            // const result = await this.gatewayBookingService.handleCreateBooking(payload);
            // return result;
        }
        else {
            console.log("Create Booking web in run background ", payload);
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
                    const updateFields = {
                        state: 'NOTFOUND',
                    };
                    this.gatewayBookingService.updateBookingFields(bookingId, updateFields)
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
                            const updateFields = {
                                state: 'TRANSITING',
                                driverId: nearestDriver.driverId
                            };
                            this.gatewayBookingService.updateBookingFields(bookingId, updateFields)
                            this.userService.updateStatusDriver(+nearestDriver.driverId, 'driving');
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
                        const updateFields = {
                            state: 'NOTFOUND',
                        };
                        this.gatewayBookingService.updateBookingFields(bookingId, updateFields)
                        return {
                            statusCode: 400,
                            message: 'Driver not available',
                            driverInfo: nearestDriver,
                        }
                    }
                } catch (error) {
                    console.log("Failed to send driver info", error);
                    //cho nay can danh dau tai xe da bỏ qua cuoc xe 
                    const updateFields = {
                        state: 'NOTFOUND',
                    };
                    this.gatewayBookingService.updateBookingFields(bookingId, updateFields)
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
