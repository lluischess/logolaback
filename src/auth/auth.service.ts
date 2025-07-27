import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import { CreateUserDto, LoginDto, RegisterDto, UpdateAuthDto } from './dto';

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
      throw new InternalServerErrorException(error);
    }

  }

  async login(loginDto: LoginDto) : Promise<LoginResponse> {

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

  async register(registerDto : RegisterDto) : Promise<LoginResponse> {

    const user = await this.create(registerDto);
    
    return {
      user: user,
      token: this.getjwtToken({ id: user._id })
    }
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById(id: string) {

    const user = await this.userModel.findById(id);
    const { password, ...rest } = user.toJSON();

    return rest;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }

  getjwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);

    return token;
    
  }

  // Método para inicializar los 4 usuarios administradores
  async initializeAdminUsers() {
    try {
      console.log('🗑️  Eliminando todos los usuarios existentes...');
      await this.userModel.deleteMany({});
      console.log('✅ Usuarios existentes eliminados');

      // Definir los 4 usuarios administradores
      const adminUsers = [
        {
          name: 'Lluis Admin',
          email: 'lluisadmin',
          password: 'JFH83udjjc//0kke-',
          isActive: true
        },
        {
          name: 'Jordi Admin', 
          email: 'jordiadmin',
          password: 'V0lv0-Casamajor',
          isActive: true
        },
        {
          name: 'Anna Admin',
          email: 'annaadmin', 
          password: 'V0lv0-Clemente',
          isActive: true
        },
        {
          name: 'Invitado Admin',
          email: 'invitadoadmin',
          password: 'ijsfoi394dsf-ad!T',
          isActive: true
        }
      ];

      console.log('👥 Creando los 4 usuarios administradores...');
      const createdUsers = [];
      
      for (const userData of adminUsers) {
        const hashedPassword = bcryptjs.hashSync(userData.password, 10);
        
        const user = new this.userModel({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          isActive: userData.isActive
        });

        await user.save();
        const { password: _, ...userWithoutPassword } = user.toJSON();
        createdUsers.push(userWithoutPassword);
        console.log(`✅ Usuario creado: ${userData.email}`);
      }

      console.log('🎉 ¡Todos los usuarios administradores han sido creados exitosamente!');
      
      return {
        success: true,
        message: 'Usuarios administradores inicializados correctamente',
        users: createdUsers,
        credentials: [
          { user: 'lluisadmin', password: 'JFH83udjjc//0kke-' },
          { user: 'jordiadmin', password: 'V0lv0-Casamajor' },
          { user: 'annaadmin', password: 'V0lv0-Clemente' },
          { user: 'invitadoadmin', password: 'ijsfoi394dsf-ad!T' }
        ]
      };

    } catch (error) {
      console.error('❌ Error durante la inicialización:', error);
      throw new InternalServerErrorException('Error al inicializar usuarios administradores');
    }
  }
}
