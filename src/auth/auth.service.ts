import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) 
    private userModel: Model<User>,
    private jwtService: JwtService
  ) {

  }


  async create(createUserDto: CreateUserDto): Promise<User> {
    
    try {
      const { password, ...userData } = createUserDto;
      const user = new this.userModel(
        {
          // Encriptar contraseña:
          password: bcryptjs.hashSync(password, 10),
          ...userData
        }
      );
      await user.save();
      const { password: _, ...newUser } = user.toJSON();
      return newUser;

    } catch (error) {
      console.log(error);
    }

  }

  async login(loginDto: LoginDto) {

    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Email not found');
    } 

    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Password invalid');
    }

    const { password: _, ...rest } = user.toJSON();

    return {
      user: rest,
      token: this.getjwtToken({ id: user.id })
    };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getjwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);

    return token;
    
  }
}
