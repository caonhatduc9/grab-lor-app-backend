import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { Role } from 'src/entities/role.entity';
import { Asset } from 'output/entities/Asset';
import { CreateCustomerDto } from './dto/createCustomer.dto';
import { Customer } from 'src/entities/customer.entity';
@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY') private userRepository: Repository<User>,
    @Inject('ROLE_REPOSITORY') private roleRepository: Repository<Role>,
    @Inject('ASSET_REPOSITORY') private assetRepository: Repository<Asset>,
    @Inject('CUSTOMER_REPOSITORY') private customerRepository: Repository<Customer>,
    
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
}
