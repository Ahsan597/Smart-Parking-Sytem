import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { User } from '../users/entities/user.entity';

@Controller('vehicles')
@UseGuards(JwtAuthGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.vehiclesService.findAllForUser(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.vehiclesService.findOneForUser(user.id, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.vehiclesService.remove(user.id, id);
  }
}
