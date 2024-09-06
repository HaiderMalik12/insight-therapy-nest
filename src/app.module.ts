import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [UsersModule, CommonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
