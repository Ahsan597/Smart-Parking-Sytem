import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SlotsService } from './slots.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { UpdateSlotStatusDto } from './dto/update-slot-status.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Controller()
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Post('floors/:floorId/slots')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARKING_MANAGER)
  create(
    @Param('floorId') floorId: string,
    @Body() dto: CreateSlotDto,
    @CurrentUser() user: User,
  ) {
    return this.slotsService.create(floorId, dto, user);
  }

  @Get('floors/:floorId/slots')
  findAllForFloor(@Param('floorId') floorId: string) {
    return this.slotsService.findAllForFloor(floorId);
  }

  @Get('slots/:id')
  findOne(@Param('id') id: string) {
    return this.slotsService.findOne(id);
  }

  @Patch('slots/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARKING_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateSlotDto, @CurrentUser() user: User) {
    return this.slotsService.update(id, dto, user);
  }

  @Patch('slots/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARKING_MANAGER)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSlotStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.slotsService.updateStatus(id, dto, user);
  }

  @Delete('slots/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PARKING_MANAGER)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.slotsService.remove(id, user);
  }
}
