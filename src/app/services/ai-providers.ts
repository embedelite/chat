import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import { fetch as tauriFetch, ResponseType, HttpVerb, Body } from "@tauri-apps/api/http";

// Custom fetch function using Tauri's HTTP module
async function customFetch(
    url: RequestInfo | URL,
    options: RequestInit = {}
): Promise<Response> {
    const method = options.method as HttpVerb || 'GET';
    const headers = options.headers as Record<string, string>;

    let body: Body | undefined;
    if (options.body) {
        if (typeof options.body === 'string') {
            body = Body.text(options.body);
        } else if (options.body instanceof FormData) {
            body = Body.form(options.body);
        } else if (options.body instanceof Uint8Array) {
            body = Body.bytes(options.body);
        } else {
            body = Body.json(options.body);
        }
    }

    const response = await tauriFetch(url.toString(), {
        method,
        headers,
        body,
        timeout: 30, // seconds
        responseType: ResponseType.Text,
    });

    return new Response(response.data as BodyInit, {
        status: response.status,
        statusText: response.status.toString(),
        headers: new Headers(response.headers),
    });
}

export interface AIServiceStrategy {
    sendMessage(message: string, history: any[]): AsyncIterableIterator<any>;
}
export class OpenAIStrategy implements AIServiceStrategy {
    private openai: OpenAI;

    constructor(private apiKey: string, private model: string) {
        this.openai = new OpenAI({
            apiKey: this.apiKey,
            dangerouslyAllowBrowser: true,
            maxRetries: 5,
            fetch: customFetch as unknown as typeof fetch,
        });
    }

    async* sendMessage(message: string, history: any[]): AsyncIterableIterator<any> {
        const stream = await this.openai.chat.completions.create({
            model: this.model,
            messages: [...history, { role: "user", content: message }],
            stream: true,
        });

        for await (const chunk of stream) {
            if (chunk.choices[0]?.delta?.content) {
                yield { text: chunk.choices[0].delta.content };
            }
        }
        yield { type: 'done' };
    }
}

export class AnthropicStrategy implements AIServiceStrategy {
    private client: Anthropic;

    constructor(private apiKey: string, private model: string) {
        this.client = new Anthropic({
            apiKey: this.apiKey,
            fetch: customFetch as unknown as typeof fetch,
        });
    }

    async* sendMessage(message: string, history: any[]): AsyncIterableIterator<any> {
        const formattedMessages = this.formatMessages(history, message);

        const stream = await this.client.messages.stream({
            messages: formattedMessages,
            model: this.model,
            max_tokens: 1024,
        });

        for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && 'text' in chunk.delta) {
                yield { text: chunk.delta.text };
            } else if (chunk.type === 'message_stop') {
                yield { type: 'done' };
            }
        }
    }

    private formatMessages(history: any[], newMessage: string): { role: 'user' | 'assistant', content: string }[] {
        let formattedMessages: { role: 'user' | 'assistant', content: string }[] = [];

        // Format the history
        for (let i = 0; i < history.length; i++) {
            formattedMessages.push({
                role: history[i].role as 'user' | 'assistant',
                content: history[i].content
            });
        }

        // Add the new user message
        formattedMessages.push({ role: 'user', content: newMessage });

        // Ensure the messages alternate between user and assistant
        formattedMessages = formattedMessages.filter((msg, index) => {
            if (index === 0) return msg.role === 'user';
            return msg.role !== formattedMessages[index - 1].role;
        });

        return formattedMessages;
    }
}
