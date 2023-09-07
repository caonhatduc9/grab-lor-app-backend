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
    }
}
