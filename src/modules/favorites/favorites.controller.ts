import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { FavoritesService } from './favorites.service';
import { User } from '../users/entities/user.entity';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':locationId')
  @ResponseMessage('Added to favorites')
  add(@CurrentUser() user: User, @Param('locationId') locationId: string) {
    return this.favoritesService.add(user.id, locationId);
  }

  @Delete(':locationId')
  @ResponseMessage('Removed from favorites')
  remove(@CurrentUser() user: User, @Param('locationId') locationId: string) {
    return this.favoritesService.remove(user.id, locationId);
  }

  @Get()
  @ResponseMessage('Favorite locations fetched successfully')
  findAll(@CurrentUser() user: User) {
    return this.favoritesService.findAllForUser(user.id);
  }
}
