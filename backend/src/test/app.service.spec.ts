import { AppService } from '../app.service';

describe('AppService', () => {
  let appService: AppService;

  beforeEach(() => {
    appService = new AppService();
  });

  describe('getHello', () => {
    it('should return greeting message', () => {
      expect(appService.getHello()).toBe('Greetings from Locally Backend 🫆');
    });
  });
});
