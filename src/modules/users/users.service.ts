import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateManagerDto } from './dto/create-manager.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  findAll(role?: UserRole): Promise<User[]> {
    if (role) {
      return this.usersRepository.find({ where: { role } });
    }
    return this.usersRepository.find();
  }

  async createManager(dto: CreateManagerDto): Promise<User> {
    const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const manager = this.usersRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      password: hashedPassword,
      phone: dto.phone,
      role: UserRole.PARKING_MANAGER,
    });
    return this.usersRepository.save(manager);
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    const user = await this.findById(id);
    user.role = role;
    return this.usersRepository.save(user);
  }
}
