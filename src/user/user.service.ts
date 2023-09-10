import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { Role } from 'src/entities/role.entity';
import { Asset } from '../entities/asset.entity';
import { CreateCustomerDto } from './dto/createCustomer.dto';
import { Customer } from 'src/entities/customer.entity';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UploadImageService } from 'src/upload-image/upload-image.service';
import { Driver } from 'src/entities/driver.entity';
import { Location } from 'src/entities/location.entity';
import { DriverStatus } from './user.constan';
@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY') private userRepository: Repository<User>,
    @Inject('ROLE_REPOSITORY') private roleRepository: Repository<Role>,
    @Inject('ASSET_REPOSITORY') private assetRepository: Repository<Asset>,
    @Inject('CUSTOMER_REPOSITORY')
    private customerRepository: Repository<Customer>,
    @Inject('DRIVER_REPOSITORY')
    private driverRepository: Repository<Driver>,
    @Inject('LOCATION_REPOSITORY')
    private locationRepository: Repository<Location>,
    private readonly uploadImageService: UploadImageService,
  ) { }
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
  async findOne(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }
  async create(createUserDto: CreateUserDto): Promise<User> {
    const savedUser = await this.userRepository.save(createUserDto);
    return savedUser;
  }

  async deleteUser(id: number): Promise<any> {
    return await this.userRepository.delete(id);
  }
  async deleteDriver(id: number): Promise<any> {
    return await this.driverRepository.delete(id);
  }
  async deleteCustomer(id: number): Promise<any> {
    return await this.customerRepository.delete(id);
  }

  async findUserByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email } });
  }
  async updatePasswordById(id: number, newPassword: string): Promise<any> {
    return this.userRepository.update(id, { password: newPassword });
  }

  async findRoleByName(name: string): Promise<Role> {
    return await this.roleRepository.findOne({ where: { roleName: name } });
  }

  async saveAvatarUrl(avatarUrl: string): Promise<any> {
    const newAsset = new Asset();
    newAsset.url = avatarUrl;
    newAsset.type = 'IMAGE';
    return await this.assetRepository.save(newAsset);
  }

  async getUserCustomerById(customerId: number): Promise<any> {
    const result = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.customer', 'customer')
      .where('customer.customerId = :customerId', { customerId })
      .getOne();
    return result;
  }
  async getUserCustomerByPhoneNumber(phoneNumber: string): Promise<any> {
    const result = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.customer', 'customer')
      .where('user.phoneNumber = :phoneNumber', { phoneNumber })
      .getOne();
    return result;
  }

  async saveCustomer(customer: Customer): Promise<Customer> {
    return await this.customerRepository.save(customer);
  }
  async saveDriver(driver: Driver): Promise<Driver> {
    return await this.driverRepository.save(driver);
  }
  async update(
    userId: number,
    updateUserDto: UpdateUserDto,
    fileAvatar: Express.Multer.File,
  ): Promise<any> {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    delete user.password;
    user.username = updateUserDto.username;
    user.phoneNumber = updateUserDto.phoneNumber;
    // Object.assign(user, { ...updateUserDto })
    if (fileAvatar) {
      const uploadedImage = await this.uploadImageService.uploadImage(
        fileAvatar,
      );
      if (uploadedImage) {
        const foundAsset = await this.assetRepository.findOneBy({
          assetId: user.avatar,
        });
        if (foundAsset) {
          foundAsset.url = uploadedImage.url;
          await this.assetRepository.save(foundAsset);
        } else {
          const newAsset = await this.saveAvatarUrl(uploadedImage.url);
          user.avatar = newAsset.assetId;
        }
      }
    }
    console.log(await this.userRepository.save(user));
    return {
      statusCode: 200,
      message: 'Update user successfully',
    };
    // if(user.role.roleName ===)
    // const newAsset = await this.saveAvatarUrl(avatarUrl.path);
    // user.avatarUrl = newAsset.url;
    // return await this.userRepository.save(user);
  }

  async getDrivers(): Promise<Driver[]> {
    const drivers = await this.driverRepository
      .createQueryBuilder('driver')
      .leftJoinAndSelect('driver.location2', 'location')
      .getMany();
    return drivers;
  }
  async getDriversOnline(): Promise<Driver[]> {
    const drivers = await this.driverRepository
      .createQueryBuilder('driver')
      .leftJoinAndSelect('driver.location2', 'location')
      .where('driver.status = :status', { status: 'online' })
      .getMany();
    return drivers;
  }
  async getDriver(driverId: number): Promise<Driver> {
    const driver = await this.driverRepository.findOne({ where: { driverId } });
    return driver;
  }
  async updateLocationDriver(
    driverId: number,
    location: { lat: string; lon: string },
  ): Promise<any> {
    console.log("check location in file usser.Service;;133");
    const driver = await this.driverRepository.findOne({ where: { driverId } });
    if (!driver) {
      throw new NotFoundException(`Driver with id ${driverId} not found`);
    }

    const updateLocation = new Location();
    console.log('driver.location', location.lat, location.lon);
    updateLocation.locationId = driver.location;
    updateLocation.lat = location.lat;
    updateLocation.lon = location.lon;
    console.log('ago to update location');
    return await this.locationRepository.save(updateLocation);
  }

  async updateStatusDriver(driverId: number, status: string): Promise<any> {
    const driver = await this.driverRepository.findOne({ where: { driverId } });
    if (!driver) {
      throw new NotFoundException(`Driver with id ${driverId} not found`);
    }
    driver.status = status as DriverStatus;
    return await this.driverRepository.save(driver);
  }

  async createCustomerForWeb({ phoneNumber, customerName }): Promise<any> {

    const roleName = "customer"; // Vai trò được chọn từ payload, ở đây ví dụ là "customer"
    const foundRole = await this.findRoleByName(roleName);
    if (!foundRole) {
      throw new BadRequestException('Invalid role');
    }

    const user = new User();
    user.roleId = foundRole.roleId;
    user.phoneNumber = phoneNumber;
    user.username = customerName;
    const savedUser = await this.userRepository.save(user);
    const newCustomer = new Customer();
    newCustomer.userId = savedUser.userId;
    const savedCustomer = await this.customerRepository.save(newCustomer);
    return savedCustomer;
  }
}
