import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto, RegisterDto, UpdateAuthDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // CREACIÓN DE USUARIOS DESACTIVADA - Solo usuarios administradores predefinidos
  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.authService.create(createUserDto);
  // }


  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // REGISTRO DESACTIVADO - Solo usuarios administradores predefinidos
  // @Post('/register')
  // register(@Body() registerDto: RegisterDto) {
  //   return this.authService.register(registerDto);
  // }

  @UseGuards( AuthGuard)
  @Get()
  findAll( @Request() req: Request ) {
   // const user = req['user'];
    return this.authService.findAll();
  }

  @UseGuards( AuthGuard)
  @Get('/check-token')
  checkToken( @Request() req: Request ) {
    const user = req['user'] as User;
    return {
      user,
      token: this.authService.getjwtToken({ id: user._id })
    }
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
