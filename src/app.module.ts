import { ConfigModule, ConfigService } from '@nestjs/config';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CheckUserIdMiddleware } from './common/middlewares/check-user-id-middleware.service';
import { JwtService } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { BindBlogWithUserUseCase } from './blogs/providers/use-cases/bind-blog-with-user-use-case';
import { CreateNewBlogUseCase } from './blogs/providers/use-cases/create-new-blog-use-case';
import { EditBlogUseCase } from './blogs/providers/use-cases/edit-blog-use-case';
import { DeleteBlogUseCase } from './blogs/providers/use-cases/delete-blog-use-case';
import { CreateNewUserUseCase } from './users/providers/use-cases/create-new-user-use-case';
import { DeleteUserUseCase } from './users/providers/use-cases/delete-user-use-case';
import { CreateNewPostUseCase } from './posts/providers/use-cases/create-new-post-use-case';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/mongo-schema/user.schema';
import { Blog, BlogSchema } from './blogs/domain/blog.schema';
import { Post, PostSchema } from './posts/domain/post.schema';
import { Comment, CommentSchema } from './comments/domain/comment.schema';
import { getMongoConfig } from './common/configs/mongo.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { UsersService } from './users/providers/users.service';
import { UsersRepository } from './users/providers/users.repository';
import { UsersQueryRepository } from './users/providers/users.query.repository';
import { MailService } from './common/mail.service/mail.service';
import { BasicStrategy } from './common/strategies/auth-basic.strategy';
import { IsBlogExistConstraint } from './posts/common/blog-id-validate';
import { IsUniqLoginOrEmailConstraint } from './common/validators/login-or-emai-uniq-validate';
import { AuthController } from './auth/auth.controller';
import { BlogsController } from './blogs/blogs.controller';
import { SaBlogsController } from './blogs/sa-blogs.controller';
import { BloggerBlogsController } from './blogs/blogger-blogs.controller';
import { CommentsController } from './comments/comments.controller';
import { PostsController } from './posts/posts.controller';
import { SecurityController } from './security/security.controller';
import { TestingController } from './testing/testing.controller';
import { LocalStrategy } from './common/strategies/local.strategy';
import { RefreshTokenStrategy } from './common/strategies/refresh-token.strategy';
import { AccessTokenStrategy } from './common/strategies/access-token.strategy';
import { tokenService } from './auth/providers/token.service';
import { BlogsRepository } from './blogs/providers/blogs.repository';
import { BlogsQueryRepository } from './blogs/providers/blogs.query.repository';
import { CommentsRepository } from './comments/providers/comments.repository';
import { PostsRepository } from './posts/providers/posts.repository';
import { PostsQuerySqlRepository } from './posts/providers/posts.query.sql.repository';
import { SecurityService } from './security/providers/security.service';
import { TestingService } from './testing/testing.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { EditPostUseCase } from './posts/providers/use-cases/edit-post-use-case';
import { UpdatePostLikeStatusUseCase } from './posts/providers/use-cases/update-post-like-status-use-case';
import { DeletePostUseCase } from './posts/providers/use-cases/delete-post-use-case';
import { RegistrationUserUseCase } from './users/providers/use-cases/registration-user-use-case';
import { SaUsersController } from './users/sa-users.controller';
import { BanUserUseCase } from './users/providers/use-cases/ban-user-use-case';
import { CreateCommentUseCase } from './comments/providers/use-cases/create-comment-use-case';
import { DeleteCommentUseCase } from './comments/providers/use-cases/delete-comment-use-case';
import { UpdateCommentUseCase } from './comments/providers/use-cases/update-comment-use-case';
import { UpdateLikeStatusUseCase } from './comments/providers/use-cases/update-like-status-use-case';
import { LogoutUseCase } from './auth/providers/use-cases/logout-use-case';
import { PasswordRecoveryUseCase } from './auth/providers/use-cases/password-recovery-use-case';
import { RegistrationConfirmationUseCase } from './auth/providers/use-cases/registration-confirmation-use-case';
import { RegistrationEmailResendingUseCase } from './auth/providers/use-cases/registration-email-resending-use-case';
import { SetNewPasswordUseCase } from './auth/providers/use-cases/set-new-password-use-case';
import { SignInUseCase } from './auth/providers/use-cases/sign-in-use-case';
import { RefreshTokenUseCases } from './auth/providers/use-cases/refresh-token-use-cases';
import { BanCommentLikesUseCase } from './comments/providers/use-cases/ban-comment-likes-use-case';
import { BanCommentUseCase } from './comments/providers/use-cases/ban-comment-use-case';
import { BanPostLikesUseCase } from './posts/providers/use-cases/ban-post-likes-use-case';
import { BanPostsUseCase } from './posts/providers/use-cases/ban-posts-use-case';
import { BloggerBanUserUseCase } from './blogs/providers/use-cases/blogger-ban-user-use-case';
import { BloggerUsersController } from './users/blogger-users.controller';
import { BanBlogCommentByCommentatorIdUseCase } from './comments/providers/use-cases/ban-blog--comments-by-user-id--use-case';
import { BanBlogUseCase } from './blogs/providers/use-cases/ban-blog-use-case';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UsersSqlRepository } from './users/providers/users.sql.repository';
import { UsersQuerySqlRepository } from './users/providers/users.query-sql.repository';
import { TestingRepository } from './testing/testing.repository';
import { TestingSqlRepository } from './testing/testing.sql.repository';
import { DeleteSessionByIdUseCase } from './security/providers/use-cases/delete-session-by-id.use-case';
import { DeleteAllSessionExcludeCurrentUseCase } from './security/providers/use-cases/delete-all-sessions-exclude-current.use-case';
import { GetSessionsByUserIdUseCase } from './security/providers/use-cases/get-sessions-by-user-id.use-case';
import { BlogsSqlRepository } from './blogs/providers/blogs.sql.repository';
import { BlogsQuerySqlRepository } from './blogs/providers/blogs.query.sql.repository';
import { PostsSqlRepository } from './posts/providers/posts.sql.repository';
import { PostsQueryRepository } from './posts/providers/posts.query.repository';
import { ValidateUserDeviceSessionUseCase } from './auth/providers/use-cases/validate-user-device-session.use-case';
import { ValidateUserUseCase } from './auth/providers/use-cases/validate-user.use-case';
import { CommentsSqlRepository } from './comments/providers/comments.sql.repository';
import { CommentsQuerySqlRepository } from './comments/providers/comments.query.sql.repository';
import { LikesQuerySqlRepository } from './common/providers/likes.query.sql.repository';
import { UsersTypeOrmRepository } from './users/providers/users.typeorm.repository';
import { UserEntity } from './users/entities/user.entity';
import { DeviceSessionsEntity } from './users/entities/device-sessions.entity';
import { EmailConfirmationEntity } from './users/entities/email-confirmation.entity';
import { PasswordRecoveryInformationEntity } from './users/entities/password-recovery-information.entity';
import { BanInfoEntity } from './users/entities/ban-info.entity';
import { UsersQueryTypeormRepository } from './users/providers/users.query-typeorm.repository';

const configModule = ConfigModule.forRoot();
const userEntities = [
  UserEntity,
  DeviceSessionsEntity,
  BanInfoEntity,
  EmailConfirmationEntity,
  PasswordRecoveryInformationEntity,
];

const blogsUseCases = [
  BindBlogWithUserUseCase,
  CreateNewBlogUseCase,
  EditBlogUseCase,
  DeleteBlogUseCase,
  BanBlogUseCase,
];
const usersUseCases = [
  CreateNewUserUseCase,
  DeleteUserUseCase,
  RegistrationUserUseCase,
  BanUserUseCase,
  BloggerBanUserUseCase,
];
const postsUseCases = [
  EditPostUseCase,
  CreateNewPostUseCase,
  UpdatePostLikeStatusUseCase,
  DeletePostUseCase,
  UpdatePostLikeStatusUseCase,
  BanPostLikesUseCase,
  BanPostsUseCase,
];

const commentsUseCases = [
  BanBlogCommentByCommentatorIdUseCase,
  CreateCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentUseCase,
  UpdateLikeStatusUseCase,
  BanCommentLikesUseCase,
  BanCommentUseCase,
];

const authUseCases = [
  LogoutUseCase,
  PasswordRecoveryUseCase,
  RegistrationConfirmationUseCase,
  RegistrationEmailResendingUseCase,
  SetNewPasswordUseCase,
  SignInUseCase,
  RefreshTokenUseCases,
  ValidateUserDeviceSessionUseCase,
  ValidateUserUseCase,
];

const securityUseCases = [
  DeleteSessionByIdUseCase,
  DeleteAllSessionExcludeCurrentUseCase,
  GetSessionsByUserIdUseCase,
];
export const options: TypeOrmModuleOptions =
  process.env.DB_LOCATION === 'LOCAL'
    ? {
        type: 'postgres',
        host: process.env.LOCAL_PGHOST,
        port: 5432,
        username: process.env.LOCAL_PGUSER,
        password: process.env.LOCAL_PGPASSWORD,
        database: process.env.LOCAL_PGDATABASE,
        autoLoadEntities: true,
        synchronize: true,
      }
    : {
        type: 'postgres',
        host: process.env.PGHOST,
        port: 5432,
        username: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        autoLoadEntities: true,
        synchronize: true,
        ssl: true,
      };

@Module({
  imports: [
    configModule,
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    TypeOrmModule.forRoot(options),
    TypeOrmModule.forFeature([...userEntities]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMongoConfig,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          ignoreTLS: true,
          secure: true,
          auth: {
            user: config.get('SMTP_USER'),
            pass: config.get('SMTP_PASS'),
          },
          tls: { rejectUnauthorized: false },
        },
        defaults: {
          from: '"nest-modules" <modules@nestjs.com>',
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    CqrsModule,
  ],
  controllers: [
    AuthController,
    SaUsersController,
    BloggerUsersController,
    BlogsController,
    SaBlogsController,
    BloggerBlogsController,
    CommentsController,
    PostsController,
    SecurityController,
    TestingController,
  ],

  providers: [
    ...securityUseCases,
    ...blogsUseCases,
    ...postsUseCases,
    ...usersUseCases,
    ...commentsUseCases,
    ...authUseCases,
    //common
    ConfigService,
    JwtService,
    BasicStrategy,
    LocalStrategy,
    RefreshTokenStrategy,
    AccessTokenStrategy,
    MailService,
    LikesQuerySqlRepository,

    //decorators
    IsBlogExistConstraint,
    IsUniqLoginOrEmailConstraint,

    //auth
    tokenService,

    //blogs
    BlogsRepository,
    BlogsQueryRepository,
    BlogsSqlRepository,
    BlogsQuerySqlRepository,

    //comments
    CommentsRepository,
    CommentsSqlRepository,
    CommentsQuerySqlRepository,

    //posts
    PostsRepository,
    PostsQuerySqlRepository,
    BlogsQueryRepository,
    PostsSqlRepository,
    PostsQueryRepository,

    //security
    SecurityService,
    //users
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    UsersSqlRepository,
    UsersQuerySqlRepository,
    UsersQueryTypeormRepository,
    UsersTypeOrmRepository,
    //
    TestingService,
    TestingRepository,
    TestingSqlRepository,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckUserIdMiddleware).forRoutes('posts');
    consumer.apply(CheckUserIdMiddleware).forRoutes('comments');
    consumer.apply(CheckUserIdMiddleware).forRoutes('blogs');
    //   consumer
    //     .apply(CastPaginatorParamsMiddleware)
    //     .forRoutes({ path: '*', method: RequestMethod.GET });
  }
}
