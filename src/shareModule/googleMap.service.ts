// google-maps.service.ts
import { Injectable } from '@nestjs/common';
import { Client, createClient } from '@google/maps';
import { Driver } from 'src/entities/driver.entity';
import { promisify } from 'util';

@Injectable()
export class GoogleMapsService {
  private readonly googleMapsClient: Client;

  constructor() {
    this.googleMapsClient = createClient({
      key: 'AIzaSyCtogOBqVFXxTK6rcqW-RPuNFH1OkcUEUI',
    });
  }

  async findNearestDriver(
    pickupCoordinates: { lat: number; lon: number },
    drivers: any,
  ): Promise<any> {
    const destinations = drivers
      .map((driver) => `${driver.location2.lat},${driver.location2.lon}`)
      .join('|');

    const distanceMatrix = promisify(
      this.googleMapsClient.distanceMatrix.bind(this.googleMapsClient),
    );
    const response = await distanceMatrix({
      origins: [`${pickupCoordinates.lat},${pickupCoordinates.lon}`],
      destinations: [destinations],
      mode: 'driving', // Chỉ định phương tiện là xe đạp
    });
    // console.log("response: " + JSON.stringify(response));
    const distances = response.json.rows[0].elements;
    console.log('distances', distances);
    let minDistance = Infinity;
    let nearestDriverIndex = -1;

    distances.forEach((distance, index) => {
      if (distance.status === 'OK' && distance.distance.value < minDistance) {
        minDistance = distance.distance.value;
        nearestDriverIndex = index;
      }
    });

    if (nearestDriverIndex !== -1) {
      console.log('drivers[nearestDriverIndex]', drivers[nearestDriverIndex]);
      return drivers[nearestDriverIndex];
    } else {
      throw new Error('No driver found.');
    }
  }
}
