import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Slot } from './entities/slot.entity';
import { Floor } from '../floors/entities/floor.entity';
import { SlotsController } from './slots.controller';
import { SlotsService } from './slots.service';

@Module({
  imports: [TypeOrmModule.forFeature([Slot, Floor])],
  controllers: [SlotsController],
  providers: [SlotsService],
})
export class SlotsModule {}
