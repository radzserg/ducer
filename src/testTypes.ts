export interface UserInput {
  first_name: string;
  last_name: string;
}

export interface User {
  id: number;
  firstName: string;
  lastMame: string;
  createdAt: Date;
}

export interface PaidProjectInput {
  id: number;
  title: string;
}

export interface PaidProject {
  id: number;
  title: string;
}

export interface UserSettingsInput {
  id: number;
  title: string;
}

export interface UserSettings {
  id: number;
  title: string;
}
