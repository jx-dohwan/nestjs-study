import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../../src/entities/user/user.entity';
import { Post } from '../../src/entities/post/post.entity';


export function getTestTypeOrmConfig(): TypeOrmModuleOptions {
    return {
        type:'mysql',
        host: 'localhost',
        port: 3307,
        username: 'test_user',
        password: 'test_password',
        database: 'nestjs_practice_test',
        entities: [User, Post],
        synchronize: true,
        dropSchema: true,
        logging: false,
    }
}