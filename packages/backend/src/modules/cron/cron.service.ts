import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PaymentService } from '../payments/payment.service';
import { Sequelize } from 'sequelize-typescript';
import { EOrderStatus } from 'src/database/models/user-subscriptions.model';
import { EUserStatus } from 'src/database/models/user.model';
import { appConfig } from "../../config/configuration";

const globalConfig = appConfig();

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly sequelize: Sequelize,
    private paymentService: PaymentService,
  ) {}

  // @Cron(CronExpression.EVERY_MINUTE)
  // second minute hour day-of-month months day-of-week
  @Cron(globalConfig.cron)
  async runEveryMinute() {
    await this.sequelize.transaction(async (t) => {
      this.logger.log('Started--------------');    
      const invoices = await this.paymentService.getExpiredOrders(t)
      if(invoices.length === 0) {
        this.logger.log('Finished 0 --------------------');
        return
      }
      // поставить статус expired для всех полученных
      await this.paymentService.updateOrderStatus(invoices, EOrderStatus.expired, t)
      
      const userService = this.paymentService.getUserService()
      const premiumUsers = invoices.filter(inv => inv.user.status === EUserStatus.premium).map(inv => inv.user.id)
      if(premiumUsers.length === 0) {
        this.logger.log('Finished 1 --------------------');
        return
      }
      // если пользователь  был premium - перевести во free
      await userService.updateStatus(
        EUserStatus.free, 
        premiumUsers,
        t
      )
      
      this.logger.log('Finished --------------------');
    })    
  }
}
