import { GenerateCommitMessageUseCase } from '../../application/use-cases/GenerateCommitMessageUseCase';
import { ExecuteCommitUseCase } from '../../application/use-cases/ExecuteCommitUseCase';
import { GetAvailableModelsUseCase } from '../../application/use-cases/GetAvailableModelsUseCase';
import { CommitMessage } from '../../domain/entities/CommitMessage';
import { SpinnerService } from '../../infrastructure/services/SpinnerService';
import { ColorFormatter } from '../utils/ColorFormatter';
import { InteractiveMenu } from './InteractiveMenu';

export class CLI {
  constructor(
    private readonly generateCommitMessageUseCase: GenerateCommitMessageUseCase,
    private readonly executeCommitUseCase: ExecuteCommitUseCase,
    private readonly getAvailableModelsUseCase: GetAvailableModelsUseCase,
    private readonly systemPrompt: string,
    private readonly apiMode: string
  ) {}

  async run(): Promise<void> {
    try {
      console.log(ColorFormatter.success(`Git コミットメッセージジェネレーター - ${this.apiMode.toUpperCase()} モード`));

      // Get available model
      console.log(`${this.apiMode}モードで利用可能なモデルを取得中...`);
      const modelId = await this.getAvailableModelsUseCase.execute();
      console.log(ColorFormatter.success(`✓ モデル '${modelId.getValue()}' を使用します`));

      // Initial commit message generation
      let commitMessage = await this.generateWithSpinner(modelId);
      
      if (!commitMessage) {
        return;
      }

      // Interactive menu
      const menu = new InteractiveMenu();
      
      try {
        while (true) {
          menu.displayCommitMessage(commitMessage);
          const choice = await menu.showMenu();

          switch (choice.toLowerCase()) {
            case 'c':
              const success = await this.executeCommit(commitMessage);
              if (success) {
                menu.displaySuccess('✓ コミットが正常に実行されました');
                menu.close();
                return;
              }
              break;

            case 'r':
              console.log('コミットメッセージを再生成します...');
              const newMessage = await this.generateWithSpinner(modelId);
              if (newMessage) {
                commitMessage = newMessage;
              }
              break;

            case 'q':
              console.log('終了します。');
              menu.close();
              return;

            default:
              menu.displayWarning('有効なオプションを選択してください (c/r/q)');
          }
        }
      } finally {
        menu.close();
      }
    } catch (error) {
      ColorFormatter.formatError(`エラー: ${error.message}`);
      process.exit(1);
    }
  }

  private async generateWithSpinner(modelId: any): Promise<CommitMessage | null> {
    const spinner = new SpinnerService(`${modelId.getValue()}にコミットメッセージを生成させています...`);
    
    try {
      spinner.start();
      
      const commitMessage = await this.generateCommitMessageUseCase.execute(
        modelId,
        this.systemPrompt,
        (tokens: string) => {
          spinner.updateTokens(tokens);
        }
      );

      spinner.stop(ColorFormatter.success('コミットメッセージが生成されました'));
      return commitMessage;
    } catch (error) {
      spinner.stop();
      
      if (error.message.includes('コミット対象の変更はありません')) {
        ColorFormatter.formatWarning(error.message);
        return null;
      }
      
      throw error;
    }
  }

  private async executeCommit(commitMessage: CommitMessage): Promise<boolean> {
    try {
      console.log('コミットを実行中...');
      return await this.executeCommitUseCase.execute(commitMessage);
    } catch (error) {
      ColorFormatter.formatWarning(`✗ コミットの実行に失敗しました: ${error.message}`);
      return false;
    }
  }
}