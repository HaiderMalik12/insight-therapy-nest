import { Module } from '@nestjs/common';
import { PasswordService } from './password/password.service';

@Module({
  providers: [PasswordService],
  exports: [PasswordService],
})
export class CommonModule {}
