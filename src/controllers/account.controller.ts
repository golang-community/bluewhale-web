import { Controller, Post, Get } from '@nestjs/common';

@Controller('api/account')
export class AccountController {
  @Post('login')
  login() {
    return 'login';
  }

  @Get('logout')
  logout() {
    return 'logout';
  }

  @Post('change-pwd')
  changePwd() {
    return 'changePwd';
  }

  @Post('update')
  updateUserInfo() {
    return 'update';
  }

  @Get('me')
  getCurrentUser() {
    return { a: 1 };
  }
}
