import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { CurrentUserId } from '../../common/decorators/current-user-id.param.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { GenerateTelegramBotLinkCommand } from './providers/use-cases/generate-telegram-bot-link.use-case';

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('telegram/webhook')
  setTelegramWebhook() {
    console.log('setTelegramWebhook');
  }

  @UseGuards(AccessTokenGuard)
  @Get('telegram/auth-bot-link')
  async getAuthBotLink(@CurrentUserId() userId: string) {
    const link = await this.commandBus.execute(
      new GenerateTelegramBotLinkCommand(userId),
    );
    return { link };
  }
}
