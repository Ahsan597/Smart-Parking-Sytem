import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Notification } from '../notifications/entities/notification.entity';
import { NOTIFICATION_CREATED_EVENT, SLOT_UPDATED_EVENT, SlotUpdatedEvent } from './events';

@WebSocketGateway({
  cors: { origin: true, credentials: true },
})
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  handleConnection(client: Socket): void {
    try {
      const token =
        (client.handshake.auth?.token as string) || (client.handshake.query?.token as string);
      if (!token) {
        throw new Error('No token provided');
      }
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      client.data.userId = payload.sub;
      client.join(`user:${payload.sub}`);
    } catch (error) {
      this.logger.warn(`Socket connection rejected: ${(error as Error).message}`);
      client.disconnect(true);
    }
  }

  @SubscribeMessage('joinLocation')
  handleJoinLocation(@ConnectedSocket() client: Socket, @MessageBody() locationId: string): void {
    client.join(`location:${locationId}`);
  }

  @SubscribeMessage('leaveLocation')
  handleLeaveLocation(@ConnectedSocket() client: Socket, @MessageBody() locationId: string): void {
    client.leave(`location:${locationId}`);
  }

  @OnEvent(SLOT_UPDATED_EVENT)
  handleSlotUpdated(payload: SlotUpdatedEvent): void {
    this.server.to(`location:${payload.parkingLocationId}`).emit('slotUpdated', payload);
  }

  @OnEvent(NOTIFICATION_CREATED_EVENT)
  handleNotificationCreated(payload: { userId: string; notification: Notification }): void {
    this.server.to(`user:${payload.userId}`).emit('notification', payload.notification);
  }
}
