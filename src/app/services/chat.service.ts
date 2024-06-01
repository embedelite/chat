import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { StorageService } from "./storage.service";
import { OpenAI } from "openai";

export interface Message {
  id: string;
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
  model: "gpt-3.5-turbo" | "gpt-4" | "gpt-4-turbo-preview" | "gpt-4o";
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
        { id: "1", from: "user", text: "Hello, AI!" },
        { id: "2", from: "bot", text: "Hello, user!" },
      ],
    },
  ];
  private currentChatSubject = new BehaviorSubject<Chat>(this.chats[0]);
  currentChat = this.currentChatSubject.asObservable();

  private chatsVisibility = new BehaviorSubject(true); // set initial state to 'false'
  currentVisibility = this.chatsVisibility.asObservable();

  constructor(private storageService: StorageService) {
    // Try to load chats from local storage during service initialization
    const storedChats = this.storageService.getItem<Chat[]>("chats");
    if (storedChats) {
      this.chats = storedChats;
      this.currentChatSubject.next(this.chats[0]);
    }
  }

  toggleChatsVisibility() {
    this.chatsVisibility.next(!this.chatsVisibility.value);
  }

  getChats(): Observable<Chat[]> {
    return of(this.chats);
  }

  updateChatConfig(
    chatId: string,
    mode: "ee" | "oai",
    model: "gpt-3.5-turbo" | "gpt-4" | "gpt-4-turbo-preview" | "gpt-4o",
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
      this.storageService.getItem<
        "gpt-3.5-turbo" | "gpt-4" | "gpt-4-turbo-preview"
      >("default_model") ?? "gpt-4";

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
      id: this.generateId(),
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
      this.sendMessageOAI(chatIndex, oai_api_key, model, message, history)
      .catch((err) => {
	  console.error("Failed to send message to OAI:", err);
      });
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
            id: this.generateId(),
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

  async sendMessageOAI(
    chatIndex: number,
    oai_api_key: any,
    model: string,
    message: string,
    history: any[]
  ) {
    const openai = new OpenAI({ apiKey: oai_api_key, dangerouslyAllowBrowser: true, maxRetries: 5});
    openai.chat.completions.create({
      model: model,
      messages: [...history, { role: "user", content: message }],
      stream: true,
    }).then(async (stream) => {
      const decoder = new TextDecoder("utf-8");

      let receivedString = "";
      let isNewMessage = true;
      let newMessage: Message;
      newMessage = {
	id: this.generateId(),
	from: "bot",
	text: "",
	complete: false,
      };

      for await (const chunk of stream) {
	receivedString += chunk.choices[0].delta.content;
	if (chunk.choices[0].finish_reason === "stop") {
	  receivedString += "\n";
	}
	const newLineIndex = receivedString.indexOf("\n");
	const line = receivedString.slice(0, newLineIndex);
	receivedString = receivedString.slice(newLineIndex + 1);

	if (chunk.choices && chunk.choices[0] && chunk.choices[0].delta) {
	  if (isNewMessage) {
	    this.chats[chatIndex].messages.push(newMessage);
	    isNewMessage = false;
	  } else {
	    let delta = chunk.choices[0].delta.content;
	    if (delta && delta !== "") {
	      newMessage.text += delta;
	      newMessage.complete = chunk.choices[0].finish_reason === "stop";
	    }
	  }

	  this.storageService.setItem("chats", this.chats);
	}
      }
    });
  }

  updateMessage(chatId: string, updatedMessage: Message) {
    // Find the chat based on chatId
    const chatIndex = this.chats.findIndex((chat) => chat.id === chatId);

    if (chatIndex < 0) {
      console.error(`No chat found with id: ${chatId}`);
      return;
    }

    // Within the found chat, find the message index using updatedMessage.id
    const messageIndex = this.chats[chatIndex].messages.findIndex(
      (msg) => msg.id === updatedMessage.id
    );

    if (messageIndex < 0) {
      console.error(`No message found with id: ${updatedMessage.id}`);
      return;
    }

    this.chats[chatIndex].messages[messageIndex] = updatedMessage;
    this.storageService.setItem("chats", this.chats);

    this.refreshChatAfterEdit(chatId, updatedMessage.id).catch((err) =>
      console.error("Failed to refresh chat:", err)
    );
  }

  async refreshChatAfterEdit(
    chatId: string,
    updatedMessageId: string
  ): Promise<void> {
    const chatIndex = this.chats.findIndex((chat) => chat.id === chatId);
    if (chatIndex < 0) {
      console.error(`No chat found with id: ${chatId}`);
      return;
    }

    const messageIndex = this.chats[chatIndex].messages.findIndex(
      (msg) => msg.id === updatedMessageId
    );

    this.chats[chatIndex].messages.splice(messageIndex + 1);

    let history = this.chats[chatIndex].messages.map((msg) => ({
      role: msg.from === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    const mode = this.chats[chatIndex].mode; // 'oai' or 'ee'
    const model = this.chats[chatIndex].model;
    const productId = this.chats[chatIndex].product_id;

    const lastMessage = history[history.length - 1].content;

    // Fetch new sequence of responses based on the updated history
    if (mode === "oai" && lastMessage) {
      let oai_api_key = this.storageService.getItem<string>("oai_api_key");
      await this.sendMessageOAI(chatIndex, oai_api_key, model, lastMessage, history);
    } else if (mode === "ee" && productId && lastMessage) {
      this.sendMessageEE(
        chatIndex,
        this.storageService.getItem<string>("ee_api_key"),
        productId,
        lastMessage
      );
    }
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
