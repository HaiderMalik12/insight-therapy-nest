import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  async generateHash(plainText, saltRounds) {
    return await bcrypt.hash(plainText, saltRounds);
  }

  async decryptPassword(plainText, hash) {
    return await bcrypt.compare(plainText, hash);
  }
}
