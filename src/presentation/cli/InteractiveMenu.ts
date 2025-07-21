import { CommitMessage } from '../../domain/entities/CommitMessage';
import { ColorFormatter } from '../utils/ColorFormatter';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

export class InteractiveMenu {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({ input, output });
  }

  async getUserInput(prompt: string): Promise<string> {
    const answer = await this.rl.question(prompt);
    return answer.trim();
  }

  close(): void {
    this.rl.close();
  }

  async showMenu(): Promise<string> {
    console.log('\n以下のオプションから選択してください:');
    console.log(`${ColorFormatter.success('c')}: 表示されているコミットメッセージでコミットコマンドを実行`);
    console.log(`${ColorFormatter.success('r')}: コミットメッセージの再生成`);
    console.log(`${ColorFormatter.success('q')}: 終了`);
    
    return await this.getUserInput('選択を入力してください (c/r/q): ');
  }

  displayCommitMessage(message: CommitMessage): void {
    console.log('\n生成されたコミットメッセージ:');
    console.log('-'.repeat(30));
    console.log(ColorFormatter.success(message.getContent()));
    console.log('-'.repeat(30));
  }

  displayError(message: string): void {
    ColorFormatter.formatError(message);
  }

  displayWarning(message: string): void {
    ColorFormatter.formatWarning(message);
  }

  displaySuccess(message: string): void {
    ColorFormatter.formatSuccess(message);
  }
}