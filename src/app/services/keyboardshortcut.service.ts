import { Injectable, NgZone } from "@angular/core";
import { Subject } from "rxjs";

interface ShortcutInput {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
}

@Injectable({
  providedIn: "root",
})
export class KeyboardShortcutService {
  shortcutPressed = new Subject<KeyboardEvent>();

  constructor(private ngZone: NgZone) {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener("keydown", this.handleKeyDown.bind(this));
    });
  }

  private handleKeyDown(event: KeyboardEvent) {
    this.ngZone.run(() => {
      if (event.ctrlKey || event.metaKey) {
        this.shortcutPressed.next(event);
      }
    });
  }

  addShortcut(input: ShortcutInput, action: any) {
    this.shortcutPressed.subscribe((event: KeyboardEvent) => {
      const isCtrlOrMetaPressed =
        (input.ctrlKey && (event.ctrlKey || event.metaKey)) ||
        (input.metaKey && event.metaKey);

      if (input.key === event.code && isCtrlOrMetaPressed) {
        action();
      }
    });
  }
}
