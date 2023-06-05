import { Blog } from './blog';
import { User } from '../../users/domain/user';

export class Subscription {
  constructor(public user: User, public blog: Blog) {
    this.code = null;
  }
  subscribedAt: Date;
  unsubscribedAt: Date;
  code: string | null;

  subscribe(code: string) {
    this.subscribedAt = new Date();
    this.code = code;
  }
  unsubscribe() {
    this.unsubscribedAt = new Date();
    this.code = null;
  }
}
