import { Singleton } from '@common/function/singletonDecorator';
import 'cron-parser';

import { Ticker } from './ticker';

@Singleton
export class Timer {
  private ticker = new Ticker();

  private cronMap = new Map<string, Function>();

  public addCron(cron: string, callback: Function) {
    this.cronMap.set(cron, callback);
  }
}
