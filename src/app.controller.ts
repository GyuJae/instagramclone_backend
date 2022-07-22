import { HttpService } from '@nestjs/axios';
import { Controller, Get, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Controller('')
export class AppController {
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  @Get('imgFile')
  async handler(@Res() res: Response) {
    try {
      const response = await this.httpService.axiosRef.post(
        `https://api.cloudflare.com/client/v4/accounts/${this.configService.get(
          'CF_ACCOUNT_ID',
        )}/images/v2/direct_upload`,
        undefined,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.configService.get('CF_API_TOKEN')}`,
          },
        },
      );

      return res.status(200).json({
        ok: true,
        ...response.data.result,
      });
    } catch (error) {
      return res.status(400).json({
        ok: false,
        error: `Error Occured ${error}`,
      });
    }
  }
}
