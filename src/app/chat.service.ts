import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";

export interface Message {
  from: "user" | "bot";
  text: string;
  links?: Array<{ title: string; url: string }>;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  date: Date;
}

@Injectable({ providedIn: "root" })
export class ChatService {
  private chats: Chat[] = [
    {
      id: "1",
      title: "Patent convolutional neural networks",
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
      title: "Hello AI",
      date: new Date(),
      messages: [
        { from: "user", text: "Hello, AI!" },
        { from: "bot", text: "Hello, user!" },
      ],
    },
    {
      id: "3",
      title: "Goodbye AI",
      date: new Date(),
      messages: [
        { from: "user", text: "Goodbye, AI!" },
        { from: "bot", text: "Goodbye, user!" },
      ],
    },
  ];
  private currentChatSubject = new BehaviorSubject<Chat>(this.chats[0]);
  currentChat = this.currentChatSubject.asObservable();

  getChats(): Observable<Chat[]> {
    return of(this.chats);
  }

  addChat(chat: Chat) {
    this.chats.push(chat);
  }

  switchChat(chat: Chat) {
    this.currentChatSubject.next(chat);
  }
}
