/**
 * Base Agent 클래스
 * 모든 에이전트의 기본 클래스
 */

import { ClaudeClient, ClaudeResponse } from './claude-client';

export interface AgentTask {
  id: string;
  type: string;
  input: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
  parentTaskId?: string;
  subTasks?: AgentTask[];
}

export interface AgentResult {
  taskId: string;
  success: boolean;
  output?: Record<string, any>;
  error?: string;
  cost?: {
    tokens: number;
    price: number;
  };
  subAgentResults?: AgentResult[];
}

export abstract class BaseAgent {
  protected claude: ClaudeClient;
  protected agentId: string;
  protected agentName: string;
  protected role: string;
  protected systemPrompt: string;

  constructor(agentId: string, agentName: string, role: string, systemPrompt: string) {
    this.claude = new ClaudeClient();
    this.agentId = agentId;
    this.agentName = agentName;
    this.role = role;
    this.systemPrompt = systemPrompt;
  }

  /**
   * 작업 실행 (하위 클래스에서 구현)
   */
  abstract execute(task: AgentTask): Promise<AgentResult>;

  /**
   * Claude API 호출 래퍼
   */
  protected async callClaude(
    userMessage: string,
    model: 'claude-sonnet-4-20250514' | 'claude-3-5-haiku-20241022' = 'claude-sonnet-4-20250514'
  ): Promise<ClaudeResponse> {
    return this.claude.sendMessage(
      [{ role: 'user', content: userMessage }],
      this.systemPrompt,
      model
    );
  }

  /**
   * 에이전트 정보 가져오기
   */
  getInfo() {
    return {
      id: this.agentId,
      name: this.agentName,
      role: this.role,
    };
  }
}

