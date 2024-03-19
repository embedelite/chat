import { Injectable, NgZone } from "@angular/core";

interface ShortcutInput {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
}
@Injectable({ providedIn: "root" })
export class KeyboardShortcutService {
  private shortcuts: Map<string, () => void> = new Map();

  constructor(private ngZone: NgZone) {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener("keydown", (event) => this.handleKeyDown(event));
    });
  }

  private handleKeyDown(event: KeyboardEvent): void {
    console.log("event", event);
    const shortcutKey = this.parseEvent(event);
    if (this.shortcuts.has(shortcutKey)) {
      this.ngZone.run(() => {
        const action = this.shortcuts.get(shortcutKey);
        action?.();
      });
    }
  }

  private parseEvent(event: KeyboardEvent): string {
    let keys = [];
    if (event.ctrlKey) keys.push("ctrl");
    if (event.altKey) keys.push("alt");
    if (event.shiftKey) keys.push("shift");
    if (event.metaKey) keys.push("meta");
    keys.push(event.key.toLowerCase());
    return keys.join("+");
  }

  registerShortcut(input: ShortcutInput, action: () => void): void {
    const key = `${input.ctrlKey ? "ctrl+" : ""}${input.key.toLowerCase()}`;
    this.shortcuts.set(key, action);
  }

  unregisterShortcut(input: ShortcutInput): void {
    const key = `${input.ctrlKey ? "ctrl+" : ""}${input.key.toLowerCase()}`;
    this.shortcuts.delete(key);
  }
}
