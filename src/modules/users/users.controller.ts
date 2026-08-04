import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { CreateManagerDto } from './dto/create-manager.dto';
import { User, UserRole } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ResponseMessage('Profile fetched successfully')
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Patch('me')
  @ResponseMessage('Profile updated successfully')
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ResponseMessage('Users fetched successfully')
  findAll(@Query('role') role?: UserRole) {
    return this.usersService.findAll(role);
  }

  @Post('managers')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ResponseMessage('Manager created successfully')
  createManager(@Body() dto: CreateManagerDto) {
    return this.usersService.createManager(dto);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ResponseMessage('User role updated successfully')
  updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateRole(id, dto.role);
  }
}
