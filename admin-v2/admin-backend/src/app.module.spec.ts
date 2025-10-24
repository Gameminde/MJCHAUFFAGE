import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AppService } from './app.service';

describe('AppModule', () => {
  it('se compile et expose AppService', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleRef).toBeDefined();
    const appService = moduleRef.get<AppService>(AppService);
    expect(appService).toBeDefined();
    expect(typeof appService.getHello()).toBe('string');
  });
});