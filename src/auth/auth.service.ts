import { ChangePassDto } from './dto/changePass.dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
// import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserSignupDto } from './dto/auth.signup.dto';
import { User } from '../entities/user.entity';

import * as generator from 'generate-password';
import * as bcrypt from 'bcrypt';
import { MailingService } from '../mailing/mailing.service';
import { AuthProvider, Role } from './auth.constants';
import { log } from 'console';
import { clouddebugger } from 'googleapis/build/src/apis/clouddebugger';
import { UserService } from 'src/user/user.service';
import { Customer } from 'src/entities/customer.entity';
import { Exception } from 'handlebars';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private maillingService: MailingService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    console.log('check user', email, password);
    const foundUser = await this.userService.findUserByEmail(email);
    console.log('check user find', foundUser);
    if (!foundUser) {
      throw new BadRequestException('not found user');
    }
    const passwordMatch = await bcrypt.compare(password, foundUser.password);
    if (foundUser && passwordMatch) {
      const { password, ...result } = foundUser;
      return result;
    }
    return null;
  }

  //local strategy login
  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      statusCode: 200,
      data: {
        access_token: this.jwtService.sign(payload),
        userId: user.userId,
        userName: user.username,
        email: user.email,
        avatarURL: user.avatarUrl,
        payment: 'free',
      },
    };
  }
  async signup(userSignupDto: UserSignupDto): Promise<any> {
    const email = userSignupDto.email.toLowerCase();
    const foundUser = await this.userService.findUserByEmail(email);
    if (foundUser) {
      throw new BadRequestException('Email already exists');
    }

    const user = new User();
    user.email = userSignupDto.email.toLowerCase();
    user.username = userSignupDto.email.split('@')[0];
    user.phoneNumber = userSignupDto.phoneNumber;
    const randomPassword = generator.generate({
      length: 8,
      numbers: true,
      uppercase: true,
    });
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    user.password = hashedPassword;
    console.log('password random: ', user.password);
    user.isActive = 0;
    // user.authProvider = AuthProvider.LOCAL;
    //find role
    const role = userSignupDto.role; // Vai trò được chọn từ payload, ở đây ví dụ là "customer"
    const foundRole = await this.userService.findRoleByName(role);
    if (!foundRole) {
      throw new BadRequestException('Invalid role');
    }

    user.roleId = foundRole.roleId;
    const savedUser = await this.userService.create(user);
    //save customer
    if (foundRole.roleName === Role.CUSTOMER) {
      const newCustomer = new Customer();
      newCustomer.userId = savedUser.userId;
      this.userService.saveCustomer(newCustomer);
    }
    //save driver
    if (foundRole.roleName === Role.DRIVER) {
      // const newDriver = new Customer();
      // newDriver.userId = savedUser.userId;
      // this.userService.saveDriver(newDriver);
    }
    if (savedUser) {
      // await this.settingService.createDefaultSetting(savedUser.userId);
      const subject = 'Verficiaction Code';
      const content = `<p>this is default password: <b>${randomPassword}</b>. Please change password after login</p>`;
      try {
        this.maillingService.sendMail(user.email, subject, content);
        return {
          statusCode: 200,
          message: 'sign up success',
        };
      }
      catch (err) {
        if (foundRole.roleName === Role.CUSTOMER) {
          await this.userService.deleteCustomer(savedUser.userId);
        }
        if (foundRole.roleName === Role.DRIVER) {
          await this.userService.deleteDriver(savedUser.userId);
        }
        await this.userService.deleteUser(savedUser.userId);
        return {
          statusCode: 400,
          message: 'sign up fail',
        };
      }

    } else {
      throw new InternalServerErrorException();
    }
  }

  async googleLogin(user: any) {
    if (!user) {
      throw new BadRequestException('No user from google');
    }
    const foundUser = await this.userService.findUserByEmail(user.email);
    if (foundUser) {
      if (foundUser.authProvider !== AuthProvider.GOOGLE) {
        throw new BadRequestException(
          `email ${user.email} is already used by another auth provider`,
        );
      } else {
        const payload = { username: foundUser.username, sub: foundUser.userId };
        return {
          statusCode: 200,
          data: {
            userId: foundUser.userId,
            access_token: this.jwtService.sign(payload),
            email: foundUser.email,
            userName: foundUser.username,
            avatarURL: foundUser.avatar,
            // payment: 'free',
          },
        };
      }
    } else {
      const createUser = new User();
      createUser.email = user.email;
      createUser.username = user.email.split('@')[0];
      createUser.password = 'google_auth';
      createUser.avatar = user.image;
      createUser.isActive = 1;
      createUser.authProvider = AuthProvider.GOOGLE;

      const avatar = await this.userService.saveAvatarUrl(user.image);
      createUser.avatar = avatar.assetId;
      const role = user.role; // Vai trò được chọn từ payload, ở đây ví dụ là "customer"
      const foundRole = await this.userService.findRoleByName(role);
      if (!foundRole) {
        throw new BadRequestException('Invalid role');
      }
      createUser.roleId = foundRole.roleId;

      const savedUser = await this.userService.create(createUser);
      if (savedUser) {
        // await this.settingService.createDefaultSetting(savedUser.userId);
        const payload = { username: savedUser.username, sub: savedUser.userId };
        return {
          status: 'success',
          data: {
            userId: savedUser.userId,
            access_token: this.jwtService.sign(payload),
            email: savedUser.email,
            userName: savedUser.username,
            avatarURL: savedUser.avatar,
          },
        };
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async changePassword(changePassDto: ChangePassDto): Promise<any> {
    console.log('check change passs', changePassDto);
    const foundUser = await this.userService.findUserByEmail(
      changePassDto.email,
    );
    if (!foundUser) {
      throw new NotFoundException('user not exist');
    }
    //found user
    const passwordMatch = await bcrypt.compare(
      changePassDto.currentPassword,
      foundUser.password,
    );
    if (!passwordMatch) {
      throw new BadRequestException('old password incorrect');
    }
    const hashedPassword = await bcrypt.hash(changePassDto.newPassword, 10);
    const inforUpdateReturn = await this.userService.updatePasswordById(
      foundUser.userId,
      hashedPassword,
    );
    if (inforUpdateReturn.affected > 0) {
      return {
        statusCode: 200,
        message: 'success',
      };
    } else {
      throw new InternalServerErrorException();
    }
  }

  async forgotPassword(email: string): Promise<any> {
    const foundUser = await this.userService.findUserByEmail(email);
    if (!foundUser) {
      throw new NotFoundException('user not exist');
    }
    const randomPassword = generator.generate({
      length: 8,
      numbers: true,
      uppercase: true,
    });
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    const subject = 'Fotgot Password';
    const content = `<p>this is default password: <b>${randomPassword}</b>. Please change password after login</p>`;
    this.maillingService.sendMail(email, subject, content);
    const inforUpdateReturn = await this.userService.updatePasswordById(
      foundUser.userId,
      hashedPassword,
    );
    if (inforUpdateReturn.affected > 0) {
      return {
        statusCode: 200,
        message: 'success',
      };
    } else {
      throw new InternalServerErrorException();
    }
  }
}
