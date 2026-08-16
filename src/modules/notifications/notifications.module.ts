import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { FavoriteLocation } from '../favorites/entities/favorite-location.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, FavoriteLocation])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
