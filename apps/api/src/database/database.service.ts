import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    try {
      await this.connection.runMigrations();
      console.log('Database migrations completed successfully');
    } catch (error) {
      console.error('Error running migrations:', error);
    }
  }

  async onModuleDestroy() {
    await this.connection.close();
  }

  async isConnected(): Promise<boolean> {
    try {
      return this.connection.isConnected;
    } catch {
      return false;
    }
  }

  async getConnectionInfo() {
    return {
      isConnected: this.connection.isConnected,
      database: this.connection.options.database,
      host: this.connection.options.host,
      port: this.connection.options.port,
    };
  }
}
