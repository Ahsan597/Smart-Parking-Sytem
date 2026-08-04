import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { User } from '../users/entities/user.entity';

@Controller('vehicles')
@UseGuards(JwtAuthGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ResponseMessage('Vehicle added successfully')
  create(@CurrentUser() user: User, @Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(user.id, dto);
  }

  @Get()
  @ResponseMessage('Vehicles fetched successfully')
  findAll(@CurrentUser() user: User) {
    return this.vehiclesService.findAllForUser(user.id);
  }

  @Get(':id')
  @ResponseMessage('Vehicle fetched successfully')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.vehiclesService.findOneForUser(user.id, id);
  }

  @Patch(':id')
  @ResponseMessage('Vehicle updated successfully')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ResponseMessage('Vehicle deleted successfully')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.vehiclesService.remove(user.id, id);
  }
}
