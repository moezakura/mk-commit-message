import { ILLMRepository } from '../../domain/repositories/ILLMRepository';
import { ModelId } from '../../domain/value-objects/ModelId';
import { ApiMode } from '../../domain/value-objects/ApiMode';

export class GetAvailableModelsUseCase {
  constructor(
    private readonly llmRepository: ILLMRepository,
    private readonly apiMode: ApiMode,
    private readonly defaultOpenRouterModel: string,
    private readonly defaultGroqModel: string
  ) {}

  async execute(): Promise<ModelId> {
    if (this.apiMode.isOpenRouter()) {
      return ModelId.create(this.defaultOpenRouterModel);
    }

    if (this.apiMode.isGroq()) {
      return ModelId.create(this.defaultGroqModel);
    }

    const models = await this.llmRepository.getAvailableModels();
    
    if (models.length === 0) {
      throw new Error('利用可能なモデルが見つかりませんでした');
    }

    return models[0];
  }
}