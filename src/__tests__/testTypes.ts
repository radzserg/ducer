export interface UserInput {
  firstName: string;
  lastName: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
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
