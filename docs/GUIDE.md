# PuzzleShare — Документація проєкту

## Огляд

**PuzzleShare** — платформа для оренди та обміну пазлами. Цільова аудиторія: люди, які збирають пазли і хочуть ділитися колекцією з іншими замість купівлі нових.

## Поточний стан

Проєкт знаходиться на ранній стадії (scaffold). Реалізовано:

- Базова структура Next.js 14 (App Router)
- Інтернаціоналізація (uk/en) через `next-intl`
- Авторизація (заглушка) через Auth.js v5
- Prisma підключена (схема порожня, лише конфіг)
- UI: головна сторінка, сторінка логіну, header з перемикачем мови, footer
- Стилізація: Tailwind CSS + shadcn/ui компоненти

## Стек технологій

| Шар | Технологія |
|-----|-----------|
| Фреймворк | Next.js 14.2 (App Router) |
| Мова | TypeScript 5 |
| UI | React 18, Tailwind CSS 3.4, shadcn/ui (CVA + tailwind-merge) |
| Іконки | Lucide React |
| i18n | next-intl 3.x (cookie-based locale) |
| Авторизація | Auth.js 5 (next-auth beta) — Credentials provider |
| БД | PostgreSQL через Prisma 7.8 |
| Лінтер | ESLint (next config) |

## Структура проєкту

```
puzzle/
├── prisma/
│   └── schema.prisma        # Схема БД (поки порожня)
├── src/
│   ├── app/
│   │   ├── api/auth/[...nextauth]/route.ts  # Auth.js route handler
│   │   ├── login/page.tsx   # Сторінка входу
│   │   ├── layout.tsx       # Root layout (i18n provider, header, footer)
│   │   ├── page.tsx         # Головна сторінка
│   │   └── globals.css      # Глобальні стилі + Tailwind
│   ├── components/
│   │   ├── header.tsx       # Шапка з логотипом та перемикачем мови
│   │   ├── footer.tsx       # Підвал
│   │   ├── language-switcher.tsx  # UK/EN перемикач
│   │   └── ui/button.tsx    # shadcn button
│   ├── lib/utils.ts         # cn() хелпер (clsx + tailwind-merge)
│   ├── messages/
│   │   ├── uk.json          # Українські переклади
│   │   └── en.json          # Англійські переклади
│   ├── auth.ts              # Конфігурація Auth.js
│   └── i18n.ts              # Конфігурація next-intl
├── .env.example             # Шаблон змінних середовища
├── next.config.mjs          # Next.js конфіг з next-intl плагіном
├── tailwind.config.ts       # Tailwind конфігурація
├── components.json          # shadcn/ui конфіг
└── package.json
```

## Змінні середовища

Скопіюй `.env.example` → `.env.local` і заповни:

| Змінна | Призначення |
|--------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Секрет для Auth.js (згенерувати: `openssl rand -base64 32`) |
| `AUTH_URL` | URL додатку (для auth callbacks) |
| `NEXT_PUBLIC_APP_URL` | Публічний URL (для клієнтського коду) |

## Інтернаціоналізація

- Локаль зберігається в cookie `locale` (дефолт: `uk`)
- Переклади: `src/messages/uk.json`, `src/messages/en.json`
- Перемикач мови в header

## Авторизація

Auth.js v5 з Credentials provider. Логіка `authorize()` поки не реалізована (повертає `null`). Сторінка логіну: `/login`.

## База даних

Prisma підключена до PostgreSQL, але схема моделей ще не визначена. Файл: `prisma/schema.prisma`.

## Локальна розробка

```bash
# Встановити залежності
npm install

# Налаштувати env
cp .env.example .env.local
# заповнити значення

# Запустити dev сервер
npm run dev

# Білд
npm run build
```

## Що далі (Phase 2)

Очікується реалізація:

- Моделі БД (User, Puzzle, Rental/Exchange)
- Повноцінна авторизація (реєстрація, логін, сесії)
- Каталог пазлів (`/catalog`, `/catalog/[id]`)
- Адмін-панель (`/admin/puzzles`)
- API endpoints для CRUD операцій
- Завантаження зображень
- Пошук та фільтрація
