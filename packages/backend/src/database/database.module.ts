import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { User } from "./models/user.model";
import { Technique } from "./models/technique.model";
import { Statistics } from "./models/statistics.model";

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          models: [User, Technique, Statistics],
          dialect: "postgres",
          // Используем Transaction Connection String из Supabase (порт 6543)
          uri: config.get<string>("DATABASE_URI"),
          define: {
            // underscored: true, // Это превратит createdAt в created_at в SQL запросах
            // timestamps: true,
          },
          autoLoadModels: true,
          synchronize: false, // Отключаем авто-синхронизацию, используем миграции
          dialectOptions: {
            // ssl: {
            //     require: true,
            //     rejectUnauthorized: false,
            // },
          },
        };
      },
    }),
  ],
})
export class DatabaseModule {}
