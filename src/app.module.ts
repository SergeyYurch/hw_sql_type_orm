import { ConfigModule, ConfigService } from '@nestjs/config';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CheckUserIdMiddleware } from './common/middlewares/check-user-id-middleware.service';
import { JwtService } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { BindBlogWithUserUseCase } from './features/blogs/providers/use-cases/bind-blog-with-user-use-case';
import { CreateNewBlogUseCase } from './features/blogs/providers/use-cases/create-new-blog-use-case';
import { EditBlogUseCase } from './features/blogs/providers/use-cases/edit-blog-use-case';
import { DeleteBlogUseCase } from './features/blogs/providers/use-cases/delete-blog-use-case';
import { CreateNewUserUseCase } from './features/users/providers/use-cases/create-new-user-use-case';
import { DeleteUserUseCase } from './features/users/providers/use-cases/delete-user-use-case';
import { CreateNewPostUseCase } from './features/posts/providers/use-cases/create-new-post-use-case';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './features/users/mongo-schema/user.schema';
import { Blog, BlogSchema } from './features/blogs/mongo-shema/blog.schema';
import { Post, PostSchema } from './features/posts/mongo-shema/post.schema';
import { getMongoConfig } from './common/configs/mongo.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { UsersService } from './features/users/providers/users.service';
import { UsersRepository } from './features/users/providers/users.repository';
import { UsersQueryRepository } from './features/users/providers/users.query.repository';
import { MailService } from './common/mail.service/mail.service';
import { BasicStrategy } from './common/strategies/auth-basic.strategy';
import { IsBlogExistConstraint } from './features/posts/common/blog-id-validate';
import { IsUniqLoginOrEmailConstraint } from './common/validators/login-or-emai-uniq-validate';
import { AuthController } from './features/auth/auth.controller';
import { BlogsController } from './features/blogs/blogs.controller';
import { SaBlogsController } from './features/blogs/sa-blogs.controller';
import { BloggerBlogsController } from './features/blogs/blogger-blogs.controller';
import { CommentsController } from './features/comments/comments.controller';
import { PostsController } from './features/posts/posts.controller';
import { SecurityController } from './features/security/security.controller';
import { TestingController } from './features/testing/testing.controller';
import { LocalStrategy } from './common/strategies/local.strategy';
import { RefreshTokenStrategy } from './common/strategies/refresh-token.strategy';
import { AccessTokenStrategy } from './common/strategies/access-token.strategy';
import { tokenService } from './features/auth/providers/token.service';
import { BlogsRepository } from './features/blogs/providers/blogs.repository';
import { BlogsQueryRepository } from './features/blogs/providers/blogs.query.repository';
import { CommentsRepository } from './features/comments/providers/comments.repository';
import { PostsRepository } from './features/posts/providers/posts.repository';
import { SecurityService } from './features/security/providers/security.service';
import { TestingService } from './features/testing/testing.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { EditPostUseCase } from './features/posts/providers/use-cases/edit-post-use-case';
import { UpdatePostLikeStatusUseCase } from './features/posts/providers/use-cases/update-post-like-status-use-case';
import { DeletePostUseCase } from './features/posts/providers/use-cases/delete-post-use-case';
import { RegistrationUserUseCase } from './features/users/providers/use-cases/registration-user-use-case';
import { SaUsersController } from './features/users/sa-users.controller';
import { BanUserUseCase } from './features/users/providers/use-cases/ban-user-use-case';
import { CreateCommentUseCase } from './features/comments/providers/use-cases/create-comment-use-case';
import { DeleteCommentUseCase } from './features/comments/providers/use-cases/delete-comment-use-case';
import { UpdateCommentUseCase } from './features/comments/providers/use-cases/update-comment-use-case';
import { UpdateLikeStatusUseCase } from './features/comments/providers/use-cases/update-like-status-use-case';
import { LogoutUseCase } from './features/auth/providers/use-cases/logout-use-case';
import { PasswordRecoveryUseCase } from './features/auth/providers/use-cases/password-recovery-use-case';
import { RegistrationConfirmationUseCase } from './features/auth/providers/use-cases/registration-confirmation-use-case';
import { RegistrationEmailResendingUseCase } from './features/auth/providers/use-cases/registration-email-resending-use-case';
import { SetNewPasswordUseCase } from './features/auth/providers/use-cases/set-new-password-use-case';
import { SignInUseCase } from './features/auth/providers/use-cases/sign-in-use-case';
import { RefreshTokenUseCases } from './features/auth/providers/use-cases/refresh-token-use-cases';
import { BanCommentLikesUseCase } from './features/comments/providers/use-cases/ban-comment-likes-use-case';
import { BanCommentUseCase } from './features/comments/providers/use-cases/ban-comment-use-case';
import { BanPostLikesUseCase } from './features/posts/providers/use-cases/ban-post-likes-use-case';
import { BanPostsUseCase } from './features/posts/providers/use-cases/ban-posts-use-case';
import { BloggerBanUserUseCase } from './features/blogs/providers/use-cases/blogger-ban-user-use-case';
import { BloggerUsersController } from './features/users/blogger-users.controller';
import { BanBlogCommentByCommentatorIdUseCase } from './features/comments/providers/use-cases/ban-blog--comments-by-user-id--use-case';
import { BanBlogUseCase } from './features/blogs/providers/use-cases/ban-blog-use-case';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TestingRepository } from './features/testing/testing.repository';
import { TestingTypeOrmRepository } from './features/testing/testing.type-orm.repository';
import { DeleteSessionByIdUseCase } from './features/security/providers/use-cases/delete-session-by-id.use-case';
import { DeleteAllSessionExcludeCurrentUseCase } from './features/security/providers/use-cases/delete-all-sessions-exclude-current.use-case';
import { GetSessionsByUserIdUseCase } from './features/security/providers/use-cases/get-sessions-by-user-id.use-case';
import { PostsQueryRepository } from './features/posts/providers/posts.query.repository';
import { ValidateUserDeviceSessionUseCase } from './features/auth/providers/use-cases/validate-user-device-session.use-case';
import { ValidateUserUseCase } from './features/auth/providers/use-cases/validate-user.use-case';
import { LikesQuerySqlRepository } from './common/providers/likes.query.sql.repository';
import { UsersTypeOrmRepository } from './features/users/providers/users.typeorm.repository';
import { UserEntity } from './features/users/entities/user.entity';
import { DeviceSessionsEntity } from './features/users/entities/device-sessions.entity';
import { PasswordRecoveryInformationEntity } from './features/users/entities/password-recovery-information.entity';
import { UsersQueryTypeormRepository } from './features/users/providers/users.query-typeorm.repository';
import { BlogsTypeOrmRepository } from './features/blogs/providers/blogs.type-orm.repository';
import { BlogsQueryTypeOrmRepository } from './features/blogs/providers/blogs.query.type-orm.repository';
import { BlogEntity } from './features/blogs/entities/blog.entity';
import { BlogsBannedUserEntity } from './features/blogs/entities/blogs-banned-user.entity';
import { PostEntity } from './features/posts/entities/post.entity';
import { LikeEntity } from './features/likes/entities/like.entity';
import { CommentEntity } from './features/comments/entities/comment.entity';
import { PostsQueryTypeOrmRepository } from './features/posts/providers/posts.query.type-orm.repository';
import { PostsTypeOrmRepository } from './features/posts/providers/posts.type-orm.repository';
import { CommentsTypeOrmRepository } from './features/comments/providers/comments.type-orm.repository';
import { LikesQueryTypeOrmRepository } from './features/likes/providers/likes.query.type-orm.repository';
import { LikesTypeOrmRepository } from './features/likes/providers/likes.type-orm.repository';
import { CommentsQueryTypeOrmRepository } from './features/comments/providers/comments.query.type-orm.repository';
import { SaQuizQuestionsController } from './features/quiz/sa-quiz-questions.controller';
import { QuizQuestionEntity } from './features/quiz/entities/quiz-question.entity';
import { QuizQuestionTypeOrmRepository } from './features/quiz/providers/quiz-question.type-orm.repository';
import { CreateQuestionUseCase } from './features/quiz/providers/use-cases/create-question.use-case';
import { QuizQuestionsQueryTypeOrmRepository } from './features/quiz/providers/quiz-questions.query-type-orm.repository';
import { UpdateQuestionUseCase } from './features/quiz/providers/use-cases/update-question.use-case';
import { PublishQuestionUseCase } from './features/quiz/providers/use-cases/publish-question.use-case';
import { DeleteQuestionUseCase } from './features/quiz/providers/use-cases/delete-question.use-case';
import { PairsTypeOrmRepository } from './features/game/providers/pairs.type-orm.repository';
import { PairsQueryTypeOrmRepository } from './features/game/providers/pairs.query.type-orm.repository';
import { PairEntity } from './features/game/entities/pair.entity';
import { PlayerEntity } from './features/game/entities/player.entity';
import { AnswerEntity } from './features/game/entities/ansver.entity';
import { PairGameQuizController } from './features/game/pair-game-quiz.controller';
import { ConnectionUseCase } from './features/game/providers/use-cases/connection.use-case';
import { SetAnswerUseCase } from './features/game/providers/use-cases/set-answer.use-case';
import {
  Comment,
  CommentSchema,
} from './features/comments/mongo-shema/comment.schema';

const configModule = ConfigModule.forRoot();
const userEntities = [
  UserEntity,
  DeviceSessionsEntity,
  PasswordRecoveryInformationEntity,
];
const gameEntities = [PairEntity, PlayerEntity, AnswerEntity];
//
const blogsEntities = [BlogEntity, BlogsBannedUserEntity];

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

const quizUseCases = [
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  PublishQuestionUseCase,
  DeleteQuestionUseCase,
  ConnectionUseCase,
  SetAnswerUseCase,
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
    TypeOrmModule.forFeature([
      ...userEntities,
      ...blogsEntities,
      ...gameEntities,
      PostEntity,
      LikeEntity,
      CommentEntity,
      QuizQuestionEntity,
    ]),
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
    SaQuizQuestionsController,
    PairGameQuizController,
  ],

  providers: [
    ...securityUseCases,
    ...blogsUseCases,
    ...postsUseCases,
    ...usersUseCases,
    ...commentsUseCases,
    ...authUseCases,
    ...quizUseCases,
    //common
    ConfigService,
    JwtService,
    BasicStrategy,
    LocalStrategy,
    RefreshTokenStrategy,
    AccessTokenStrategy,
    MailService,
    LikesQuerySqlRepository,
    LikesQueryTypeOrmRepository,
    LikesTypeOrmRepository,
    //decorators
    IsBlogExistConstraint,
    IsUniqLoginOrEmailConstraint,

    //quiz
    QuizQuestionTypeOrmRepository,
    QuizQuestionsQueryTypeOrmRepository,
    PairsTypeOrmRepository,
    PairsQueryTypeOrmRepository,

    //auth
    tokenService,

    //blogs
    BlogsRepository,
    BlogsQueryRepository,
    BlogsTypeOrmRepository,
    BlogsQueryTypeOrmRepository,

    //comments
    CommentsRepository,
    CommentsTypeOrmRepository,
    CommentsQueryTypeOrmRepository,

    //posts
    PostsRepository,
    BlogsQueryRepository,
    PostsQueryRepository,
    PostsQueryTypeOrmRepository,
    PostsTypeOrmRepository,

    //security
    SecurityService,
    //users
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    UsersQueryTypeormRepository,
    UsersTypeOrmRepository,

    //
    TestingService,
    TestingRepository,
    TestingTypeOrmRepository,
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
