import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) private userModel: Model<User>
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
}
