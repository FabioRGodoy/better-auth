# 🚀 API - NestJS + BetterAuth + Prisma (MongoDB)

Este projeto implementa uma **arquitetura modular (feature-based)** para uma API NestJS com autenticação **BetterAuth**, banco **MongoDB (via Prisma)** e controle de times, membros e convites.  
A arquitetura foi pensada para ser escalável, limpa e sem redundância — aproveitando ao máximo o que o BetterAuth já oferece.

---

## 📦 Stack utilizada

- **NestJS 10+**
- **BetterAuth** (autenticação completa com sessão e cookies)
- **MongoDB** (via Prisma Client)
- **@thallesp/nestjs-better-auth** (integração oficial Nest)
- **Class Validator / Transformer**
- **Helmet / CORS / Throttler** (segurança)
- **Insomnia / Thunder Client** (para testes)

---

## 🗂️ Estrutura de pastas

```
src/
├── app.module.ts
├── main.ts
│
├── auth.ts                      # Instância global do BetterAuth
│
├── better-auth-db.ts            # Conexão Mongo direta (para consultas em 'users')
│
├── prisma/
│   ├── prisma.module.ts         # Módulo global
│   └── prisma.service.ts        # Prisma Client (Mongo)
│
├── me/
│   ├── me.module.ts
│   ├── me.controller.ts         # Rotas /me e /me/with-teams
│   └── me.service.ts            # Agregações via Prisma
│
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts      # GET /users/:id
│   └── users.service.ts         # Lê 'users' direto do BetterAuth DB
│
├── teams/
│   ├── teams.module.ts
│   ├── teams.controller.ts
│   ├── teams.service.ts
│   └── dto/
│       ├── create-team.dto.ts
│       ├── invite.dto.ts
│       ├── accept-invite.dto.ts
│       └── set-role.dto.ts
│
└── common/
    └── pipes/
        └── objectid.pipe.ts     # Validação para IDs Mongo
```

---

## 🧱 Arquitetura Modular

Cada **feature** (ex: `teams`, `users`, `me`) é isolada em seu módulo:

- `controller` → entrada HTTP.
- `service` → regras de negócio.
- `dto` → validação e tipagem.
- `module` → orquestra dependências.

O **BetterAuth** atua como _AuthProvider global_ (sem precisar de guards customizados).  
Todas as rotas autenticadas utilizam o decorator:

```ts
@Session() session: UserSession
```

para acessar a sessão atual.

---

## 🧰 Banco de Dados (Prisma + Mongo)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

enum Role {
  OWNER
  ADMIN
  MEMBER
}

model Team {
  id         String       @id @map("_id") @default(auto()) @db.ObjectId
  name       String
  ownerId    String       @db.ObjectId
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt
  memberships Membership[]
  invitations Invitation[]
}

model Membership {
  id      String @id @map("_id") @default(auto()) @db.ObjectId
  teamId  String @db.ObjectId
  userId  String @db.ObjectId
  role    Role

  @@unique([teamId, userId], name: "membership_unique_team_user")
}

model Invitation {
  id         String   @id @map("_id") @default(auto()) @db.ObjectId
  teamId     String   @db.ObjectId
  email      String
  token      String   @unique
  createdAt  DateTime @default(now())
  @@index([teamId, email], name: "invitation_team_email_idx")
}
```

---

## 🔐 Autenticação (BetterAuth)

```ts
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(process.env.DATABASE_URL!);
const db = client.db();

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  database: mongodbAdapter(db),
  emailAndPassword: { enabled: true },
});
```

### Rotas criadas automaticamente pelo BetterAuth

| Método | Rota                 | Descrição          |
| ------ | -------------------- | ------------------ |
| `POST` | `/api/auth/sign-up`  | Criação de usuário |
| `POST` | `/api/auth/sign-in`  | Login              |
| `POST` | `/api/auth/sign-out` | Logout             |
| `GET`  | `/api/auth/session`  | Sessão atual       |

Essas rotas gerenciam cookies de sessão automaticamente (compatíveis com CORS + credentials).

---

## 🧑‍💻 Rotas principais (projeto)

### `/me`

| Método | Endpoint         | Descrição                            |
| ------ | ---------------- | ------------------------------------ |
| `GET`  | `/me`            | Dados do usuário logado (via sessão) |
| `GET`  | `/me/with-teams` | Usuário + memberships                |
| `GET`  | `/me/public`     | Endpoint público                     |
| `GET`  | `/me/optional`   | Sessão opcional                      |

### `/users`

| Método | Endpoint     | Descrição                                  |
| ------ | ------------ | ------------------------------------------ |
| `GET`  | `/users/:id` | Consulta usuário (direto do BetterAuth DB) |

### `/teams`

| Método  | Endpoint                 | Descrição                           |
| ------- | ------------------------ | ----------------------------------- |
| `POST`  | `/teams`                 | Cria novo time (usuário vira OWNER) |
| `GET`   | `/teams/mine`            | Lista times do usuário              |
| `POST`  | `/teams/invite`          | Convida e-mail para o time          |
| `POST`  | `/teams/accept-invite`   | Aceita convite (com token)          |
| `GET`   | `/teams/:teamId/members` | Lista membros com nome/email        |
| `PATCH` | `/teams/:teamId/role`    | Altera role de membro (ADMIN/OWNER) |

---

## 🧠 Policies de segurança

| Função               | Permissão   | Usada em           |
| -------------------- | ----------- | ------------------ |
| `ensureAdminOrOwner` | OWNER/ADMIN | invite, setRole    |
| `ensureMember`       | Membro      | listMembersForUser |

### Proteções adicionais

- Último `OWNER` não pode ser rebaixado.
- Invites só podem ser feitos por `OWNER/ADMIN`.
- Aceite de convite exige que o e-mail do convite bata com o do usuário logado.
- IDs validados por `ObjectIdPipe`.
- Rate limit global: **60 req/min/IP**.

---

## ⚙️ Configuração do ambiente

```bash
DATABASE_URL="mongodb://localhost:27017/betterauth"
BETTER_AUTH_SECRET="coloque_um_segredo_grande"
BETTER_AUTH_URL="http://localhost:3000"
PORT=3000
FRONT_ORIGIN="http://localhost:3001"
```

---

## 🚀 Rodando localmente

```bash
pnpm install
pnpm prisma generate
pnpm prisma db push
pnpm start:dev
```

---

## 🔬 Testes com Insomnia

1. `POST /api/auth/sign-up` → cria usuário
2. `POST /api/auth/sign-in` → login (gera cookie)
3. `GET /api/auth/session` → checa sessão
4. `POST /teams` → cria time
5. `POST /teams/invite` → cria convite
6. `POST /teams/accept-invite` → aceita convite
7. `GET /teams/:teamId/members` → lista membros
8. `PATCH /teams/:teamId/role` → altera role

O Insomnia mantém automaticamente o cookie de sessão enviado pelo BetterAuth.

---

## 🛡️ Segurança e boas práticas

- `helmet` habilitado globalmente (protege headers)
- `CORS` configurado para enviar cookies (`credentials: true`)
- `Throttler` limita 60 req/min por IP
- `ObjectIdPipe` impede query com ID inválido
- `ValidationPipe` ativo globalmente (DTOs validados)

---

## ✅ Status atual

✅ Autenticação completa (BetterAuth)  
✅ Sessões via cookies  
✅ Times, membros, convites, roles  
✅ Policies de segurança  
✅ Rate limit, CORS e Helmet  
✅ Testado via Insomnia

---

## 🧩 Próximos passos

- [ ] Envio real de e-mail de convite
- [ ] Exclusão de membro / transferência de ownership
- [ ] UserProfile expandido
- [ ] Documentação Swagger (OpenAPI)
- [ ] Deploy containerizado (Docker + Traefik / Fly.io)

---

## 🧾 Licença

Projeto interno (temporário).  
Feito com ❤️ e NestJS.
