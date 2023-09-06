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
  model: "gpt-3.5-turbo" | "gpt-4";
  title: string;
  messages: Message[];
  date: Date;
}

@Injectable({ providedIn: "root" })
export class ChatService {
  private readonly OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
  //private readonly EE_API_URL = "https://api.embedelite.com";
  private readonly EE_API_URL = "https://api.dev.embedelite.com";

  private chats: Chat[] = [
    {
      id: "1",
      title: "US Patent Example",
      mode: "ee",
      deactivated: true,
      product_id: "uspto",
      model: "gpt-3.5-turbo",
      date: new Date(),
      messages: [
        {
          from: "user",
          text: "Can you locate any US patents filed within the last 5 years, which discuss applying convolutional neural networks for image recognition in medical devices, even if they do not explicitly use these terms but the implied meaning aligns with this search?",
        },
        {
          from: "bot",
          text: "Yes, I have found 3 patents filed recently related to your query.",
          links: [
            {
              title:
                '1. Patent US-20230162428-A1: "APPARATUS AND METHOD FOR ACCELERATION DATA STRUCTURE REFIT" (filed on 2023-05-25 by APODACA; Michael et al.)',
              url: "https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/20230162428",
            },
            {
              title:
                '2. Patent US-20230157618-A1: "Method and System to Assess Pulmonary Hypertension Using Phase Space Tomography and Machine Learning" (filed on 2023-05-25 by Grouchy; Paul et al.)',
              url: "https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/20230157618",
            },
            {
              title:
                '3. Patent US-20230162043-A1: "SYSTEMS AND METHODS FOR MAGNETIC RESONANCE IMAGING STANDARDIZATION USING DEEP LEARNING" (filed on 2023-05-25 by Zhang; Tao et al.)',
              url: "https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/20230162043",
            },
          ],
        },
      ],
    },
    {
      id: "2",
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
    }

  }

  getChats(): Observable<Chat[]> {
    return of(this.chats);
  }

  updateChatConfig(chatId: string,
                    mode: "ee" | "oai",
                    model: "gpt-3.5-turbo" | "gpt-4",
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

  addChat(title: string): Chat {
    const defaultModel = this.storageService.getItem<"gpt-3.5-turbo" | "gpt-4">("default_model") ?? "gpt-3.5-turbo";

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
    return (this.chats.length + 1).toString();
  }

  sendMessage(chatId: string,
              message: string,
              mode: "ee" | "oai",
              model: "gpt-3.5-turbo" | "gpt-4",
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

    let history = this.chats[chatIndex].messages.map((msg) => ({
      role: msg.from === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    if (mode === "oai") {
      let oai_api_key = this.storageService.getItem<string>("oai_api_key");
      this.sendMessageOAI(chatIndex, oai_api_key, model, message, history)
    } else {
      let ee_api_key = this.storageService.getItem<string>("ee_api_key");
    }
  }
    
  sendMessageOAI(chatIndex: number, oai_api_key: any, model: string, message: string, history: any[]){
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
                    if (delta && delta !== ""){
                      newMessage.text += delta;
                      newMessage.complete = choices[0].finish_reason === "stop";
                    }
                  }

                  // Inform subscribers about the new message
                  this.currentChatSubject.next(this.chats[chatIndex]);

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
      "API-Key": ee_api_key
    };

    // make a http request get to the api http
    let url = this.EE_API_URL + "/products";
    fetch(url, {
      headers: headers,
      method: 'GET',
      mode: 'no-cors',
    }).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.error(error);
    });
  }
}
