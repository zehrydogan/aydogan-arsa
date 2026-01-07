import { Test, TestingModule } from '@nestjs/testing';
import { SavedSearchesController } from './saved-searches.controller';

describe('SavedSearchesController', () => {
  let controller: SavedSearchesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedSearchesController],
    }).compile();

    controller = module.get<SavedSearchesController>(SavedSearchesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
