import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { StorageService } from "./storage.service";

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private themeSource = new BehaviorSubject<string>("");
  currentTheme = this.themeSource.asObservable();

  constructor(private storageService: StorageService) {
    const theme = this.storageService.getItem<string>("theme") || "light";
    this.themeSource.next(theme);
    this.setThemePreference(theme);
  }

  setTheme(isDarkMode: boolean) {
    const theme = isDarkMode ? "dark" : "light";
    this.themeSource.next(theme);
    this.storageService.setItem("theme", theme);
    this.setThemePreference(theme);
  }

  setThemePreference(theme: string) {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }
}
