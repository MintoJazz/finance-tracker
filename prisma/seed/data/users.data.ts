import type { UserFixture } from "../types";

export const DEFAULT_PASSWORD = "123456";

export const usersFixture: UserFixture[] = [
  {
    name: "Ana Souza",
    email: "ana@teste.com",
    birthDate: "1994-03-12",
    phone: "53991110001",
    defaultContextName: "Finanças da Ana",
  },
  {
    name: "Bruno Lima",
    email: "bruno@teste.com",
    birthDate: "1990-07-25",
    phone: "53991110002",
    defaultContextName: "Finanças do Bruno",
  },
  {
    name: "Carla Mendes",
    email: "carla@teste.com",
    birthDate: "1988-11-02",
    phone: "53991110003",
    defaultContextName: "Finanças da Carla",
  },
  {
    name: "Diego Ferreira",
    email: "diego@teste.com",
    birthDate: "1997-01-30",
    phone: "53991110004",
    defaultContextName: "Finanças do Diego",
  },
  {
    name: "Eduarda Costa",
    email: "eduarda@teste.com",
    birthDate: "2000-09-18",
    phone: "53991110005",
    defaultContextName: "Finanças da Eduarda",
  },
];