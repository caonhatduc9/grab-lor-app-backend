import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { Role } from 'src/entities/role.entity';
import { Asset } from 'output/entities/Asset';
import { CreateCustomerDto } from './dto/createCustomer.dto';
import { Customer } from 'src/entities/customer.entity';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UploadImageService } from 'src/upload-image/upload-image.service';
@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY') private userRepository: Repository<User>,
    @Inject('ROLE_REPOSITORY') private roleRepository: Repository<Role>,
    @Inject('ASSET_REPOSITORY') private assetRepository: Repository<Asset>,
    @Inject('CUSTOMER_REPOSITORY') private customerRepository: Repository<Customer>,
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
  async saveCustomer(customer: Customer): Promise<Customer> {
    return await this.customerRepository.save(customer);
  }
  async update(userId: number, updateUserDto: UpdateUserDto, fileAvatar: Express.Multer.File): Promise<any> {

    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    delete user.password;
    user.username = updateUserDto.username;
    user.phoneNumber = updateUserDto.phoneNumber;
    // Object.assign(user, { ...updateUserDto })
    if (fileAvatar) {
      const uploadedImage = await this.uploadImageService.uploadImage(fileAvatar);
      if (uploadedImage) {
        const foundAsset = await this.assetRepository.findOneBy({ assetId: user.avatar });
        if (foundAsset) {
          foundAsset.url = uploadedImage.url;
          await this.assetRepository.save(foundAsset);
        }
        else {
          const newAsset = await this.saveAvatarUrl(uploadedImage.url);
          user.avatar = newAsset.assetId;
        }
      }
    }
    console.log(await this.userRepository.save(user));
    return {
      statusCode: 200,
      message: 'Update user successfully',
    }
    // if(user.role.roleName ===)
    // const newAsset = await this.saveAvatarUrl(avatarUrl.path);
    // user.avatarUrl = newAsset.url;
    // return await this.userRepository.save(user);
  }
}
