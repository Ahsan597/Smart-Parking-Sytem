import { ForbiddenException } from '@nestjs/common';
import { User, UserRole } from '../users/entities/user.entity';
import { ParkingLocation } from './entities/parking-location.entity';

export function assertManagesLocation(user: User, location: ParkingLocation): void {
  if (user.role === UserRole.SUPER_ADMIN) {
    return;
  }
  if (user.role === UserRole.PARKING_MANAGER && location.managerId === user.id) {
    return;
  }
  throw new ForbiddenException('You do not manage this parking location');
}
