import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { StorageService } from "./storage.service";

export interface Message {
  from: "user" | "bot";
  text: string;
  links?: Array<{ title: string; url: string }>;
  complete?: boolean;
}

export interface Chat {
  id: string;
  mode: "ee" | "oai";
  deactivated: boolean;
  product_id: string | null;
  model: "gpt-3.5-turbo" | "gpt-4" | "gpt-4-turbo-preview";
  title: string;
  messages: Message[];
  date: Date;
}

@Injectable({ providedIn: "root" })
export class ChatService {
  private readonly OPENAI_API_URL =
    "https://api.openai.com/v1/chat/completions";
  //private readonly EE_API_URL = "https://api.embedelite.com";
  private readonly EE_API_URL = "https://api.dev.embedelite.com";

  private chats: Chat[] = [
    {
      id: "1",
      mode: "oai",
      deactivated: false,
      product_id: null,
      model: "gpt-3.5-turbo",
      title: "Hello AI",
      date: new Date(),
      messages: [
        { from: "user", text: "Hello, AI!" },
        { from: "bot", text: "Hello, user!" },
      ],
    },
  ];
  private currentChatSubject = new BehaviorSubject<Chat>(this.chats[0]);
  currentChat = this.currentChatSubject.asObservable();

  constructor(private storageService: StorageService) {
    // Try to load chats from local storage during service initialization
    const storedChats = this.storageService.getItem<Chat[]>("chats");
    if (storedChats) {
      this.chats = storedChats;
      this.currentChatSubject.next(this.chats[0]);
    }
  }

  getChats(): Observable<Chat[]> {
    return of(this.chats);
  }

  updateChatConfig(
    chatId: string,
    mode: "ee" | "oai",
    model: "gpt-3.5-turbo" | "gpt-4" | "gpt-4-turbo-preview",
    productId: string | null
  ): void {
    const chatIndex = this.chats.findIndex((chat) => chat.id === chatId);
    if (chatIndex < 0) {
      console.error(`No chat found with id: ${chatId}`);
      return;
    }

    this.chats[chatIndex].mode = mode;
    this.chats[chatIndex].model = model;
    this.chats[chatIndex].product_id = productId;
    this.storageService.setItem("chats", this.chats);
  }

  switchChat(chat: Chat) {
    this.currentChatSubject.next(chat);
  }

  setChatTitle(chatId: string, title: string): void {
    const chatIndex = this.chats.findIndex((chat) => chat.id === chatId);
    if (chatIndex < 0) {
      console.error(`No chat found with id: ${chatId}`);
      return;
    }
    this.chats[chatIndex].title = title;
    this.storageService.setItem("chats", this.chats);
  }

  addChat(title: string): Chat {
    const defaultModel =
      this.storageService.getItem<"gpt-3.5-turbo" | "gpt-4" | "gpt-4-turbo-preview">("default_model") ??
      "gpt-4";

    let newChat: Chat = {
      id: this.generateId(), // Implement a method for generating unique id
      mode: "oai",
      deactivated: false,
      product_id: null,
      model: defaultModel,
      title: title,
      date: new Date(),
      messages: [],
    };
    this.chats.unshift(newChat);
    this.storageService.setItem("chats", this.chats);

    return newChat;
  }

  deleteChat(chatId: string): void {
    const index = this.chats.findIndex((c) => c.id === chatId);

    if (index !== -1) {
      this.chats.splice(index, 1);

      // Update the BehaviorSubject with currentChat data
      if (
        this.currentChatSubject.getValue().id === chatId &&
        this.chats.length
      ) {
        this.currentChatSubject.next(this.chats[0]);
      }

      // Update the storage
      this.storageService.setItem("chats", this.chats);
    }
  }

  // Implementation for generating unique id
  private generateId(): string {
    const timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
    const randomValue = crypto.getRandomValues(new Uint8Array(4)).join("");
    return `${timestamp}-${randomValue}`;
  }

  sendMessage(
    chatId: string,
    message: string,
    mode: "ee" | "oai",
    model: "gpt-3.5-turbo" | "gpt-4" | "gpt-4-turbo-preview",
    productId: string | null
  ): void {
    const chatIndex = this.chats.findIndex((chat) => chat.id === chatId);
    if (chatIndex < 0) {
      console.error(`No chat found with id: ${chatId}`);
      return;
    }

    const userMessage: Message = {
      from: "user",
      text: message,
    };
    this.chats[chatIndex].messages.push(userMessage);

    if (this.chats[chatIndex].messages[0].from === "user") {
      const firstMessage = this.chats[chatIndex].messages[0].text;
      const title =
        firstMessage.length > 16
          ? `${firstMessage.slice(0, 16)}...`
          : firstMessage;
      this.setChatTitle(chatId, title);
    }

    let history = this.chats[chatIndex].messages.map((msg) => ({
      role: msg.from === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    if (mode === "oai") {
      let oai_api_key = this.storageService.getItem<string>("oai_api_key");
      this.sendMessageOAI(chatIndex, oai_api_key, model, message, history);
    } else {
      let ee_api_key = this.storageService.getItem<string>("ee_api_key");
      if (productId === null) {
        console.log("No product id found");
        return;
      }
      this.sendMessageEE(chatIndex, ee_api_key, productId, message);
    }
  }

  sendMessageEE(
    chatIndex: number,
    ee_api_key: any,
    productId: string,
    message: string
  ) {
    const headers = {
      "Content-Type": "application/json",
      "API-Key": ee_api_key,
    };

    const body = {
      product_id: productId,
      query: message,
    };

    fetch(this.EE_API_URL + "/query", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    })
      .then((response) => {
        if (!response.body) {
          throw new Error("No ReadableStream available");
        }

        response.json().then((data) => {
          let botMessage: Message = {
            from: "bot",
            text: data.response,
          };
          this.chats[chatIndex].messages.push(botMessage);

          this.storageService.setItem("chats", this.chats);
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  sendMessageOAI(
    chatIndex: number,
    oai_api_key: any,
    model: string,
    message: string,
    history: any[]
  ) {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${oai_api_key}`,
    };

    const body = {
      model: model,
      messages: [...history, { role: "user", content: message }],
      stream: true,
    };

    fetch(this.OPENAI_API_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    })
      .then((response) => {
        if (!response.body) {
          throw new Error("No ReadableStream available");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        let receivedString = "";
        let isNewMessage = true;
        let newMessage: Message;

        const push = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }

            const chunk = decoder.decode(value);
            receivedString += chunk;

            while (receivedString.includes("\n")) {
              const newLineIndex = receivedString.indexOf("\n");
              const line = receivedString.slice(0, newLineIndex);
              receivedString = receivedString.slice(newLineIndex + 1);

              const data = line.replace(/^data: /, "").trim();

              if (data !== "" && data !== "[DONE]") {
                let parsed;
                try {
                  parsed = JSON.parse(data);
                  //console.log("Parsed line", parsed);
                } catch (e) {
                  console.error("Error parsing line", e);
                }

                if (!parsed) continue; // Skip this iteration if parsedLine is undefined
                const { choices } = parsed;

                if (choices && choices[0] && choices[0].delta) {
                  if (isNewMessage) {
                    newMessage = {
                      from:
                        choices[0].delta.role === "assistant" ? "bot" : "user",
                      text: choices[0].delta.content,
                      complete: choices[0].finish_reason === "stop",
                    };
                    this.chats[chatIndex].messages.push(newMessage);
                    isNewMessage = false;
                  } else {
                    let delta = choices[0].delta.content;
                    if (delta && delta !== "") {
                      newMessage.text += delta;
                      newMessage.complete = choices[0].finish_reason === "stop";
                    }
                  }

                  this.storageService.setItem("chats", this.chats);
                }
              }
            }
          }
        };

        push();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  updateProducts(ee_api_key: string) {
    const headers = {
      "Content-Type": "application/json",
      "API-Key": ee_api_key,
    };

    // make a http request get to the api http
    let url = this.EE_API_URL + "/products";
    fetch(url, {
      headers: headers,
      method: "GET",
      mode: "no-cors",
    })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
