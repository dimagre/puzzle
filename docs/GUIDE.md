# PuzzleShare — Гід по проєкту

## 1. Огляд продукту

PuzzleShare — платформа для оренди та обміну пазлами в Україні. Цільова аудиторія: люди, які збирають пазли і хочуть ділитися ними з іншими замість того, щоб купувати нові.

Основна ідея: каталог пазлів з можливістю перегляду, бронювання та адміністрування колекції.

## 2. Поточні URL-адреси

| Сторінка | Шлях | Статус |
|----------|------|--------|
| Головна | `/` | Готово |
| Вхід | `/login` | Готово (UI, без логіки) |
| Каталог | `/catalog` | Заплановано (Phase 2) |
| Деталі пазла | `/catalog/[id]` | Заплановано (Phase 2) |
| Адмін-панель | `/admin/puzzles` | Заплановано (Phase 2) |

## 3. Архітектура

### Технологічний стек

- **Фреймворк**: Next.js 14 (App Router)
- **Мова**: TypeScript (strict mode)
- **ORM**: Prisma + PostgreSQL
- **Стилі**: Tailwind CSS + shadcn/ui
- **Автентифікація**: Auth.js v5 (Credentials provider)
- **Інтернаціоналізація**: next-intl (uk/en, за замовчуванням — uk)

### Структура проєкту

```
puzzle/
├── prisma/
│   └── schema.prisma        # Схема бази даних
├── src/
│   ├── app/
│   │   ├── api/auth/[...nextauth]/route.ts  # Auth.js route handler
│   │   ├── login/page.tsx   # Сторінка входу
│   │   ├── page.tsx         # Головна сторінка
│   │   ├── layout.tsx       # Кореневий layout
│   │   └── globals.css      # Глобальні стилі
│   ├── components/
│   │   ├── header.tsx       # Шапка сайту
│   │   ├── footer.tsx       # Підвал сайту
│   │   ├── language-switcher.tsx  # Перемикач мови
│   │   └── ui/button.tsx    # shadcn/ui компонент
│   ├── messages/
│   │   ├── uk.json          # Українські переклади
│   │   └── en.json          # Англійські переклади
│   ├── lib/utils.ts         # Утиліти (cn helper)
│   ├── auth.ts              # Конфігурація Auth.js
│   └── i18n.ts              # Конфігурація next-intl
├── .env.example             # Шаблон змінних середовища
├── next.config.mjs          # Конфіг Next.js з next-intl plugin
├── tailwind.config.ts       # Конфіг Tailwind з кастомними кольорами
└── package.json
```

### Ключові файли

- [`src/auth.ts`](../src/auth.ts) — конфігурація автентифікації (поки що заглушка)
- [`src/i18n.ts`](../src/i18n.ts) — визначення локалі через cookie `locale`, за замовчуванням `uk`
- [`prisma/schema.prisma`](../prisma/schema.prisma) — схема БД (поки порожня, тільки datasource)
- [`tailwind.config.ts`](../tailwind.config.ts) — кастомні кольори: `sage` (#5B8C5A), `cream` (#F5F0E8), `terracotta` (#D4956A)

## 4. База даних

### Поточний стан

Prisma підключена до PostgreSQL, але схема ще порожня — містить лише конфігурацію `datasource` та `generator`. Моделі будуть додані у Phase 2.

### Заплановані моделі (Phase 2)

- **User** — користувачі (email, пароль, роль)
- **Puzzle** — пазли (назва, опис, кількість деталей, зображення, статус)
- **Booking** — бронювання (користувач, пазл, дати)

### Як запустити міграції

```bash
npx prisma migrate dev    # Створити та застосувати міграцію
npx prisma generate       # Згенерувати клієнт
npx prisma db seed        # Заповнити тестовими даними (коли seed буде додано)
```

## 5. API endpoints

Поки що єдиний endpoint — Auth.js route handler:

| Метод | Шлях | Опис | Авторизація |
|-------|------|------|-------------|
| GET/POST | `/api/auth/*` | Auth.js (sign in, sign out, session) | Публічний |

Решта API (CRUD для пазлів, бронювання) буде додана у Phase 2.

## 6. Адмін-панель

Заплановано для Phase 2. Буде доступна за `/admin/puzzles` для користувачів з роллю `admin`. Функціонал:

- Додавання нових пазлів
- Редагування існуючих
- Перегляд бронювань
- Управління користувачами

## 7. Деплой

### Платформа

Проєкт розрахований на деплой через Vercel (Next.js native platform).

### Змінні середовища

| Змінна | Опис | Приклад |
|--------|------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/puzzleshare` |
| `AUTH_SECRET` | Секрет для Auth.js сесій | Згенерувати: `openssl rand -base64 32` |
| `AUTH_URL` | Базовий URL додатку | `https://puzzleshare.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Публічний URL (для клієнта) | `https://puzzleshare.vercel.app` |

### Процес деплою

1. Push у `main` → Vercel автоматично збирає та деплоїть
2. Vercel виконує `next build`
3. Preview deploys створюються для кожного PR

## 8. Як додати дані

На поточному етапі (Phase 1) — ніяк, бо моделі ще не створені. У Phase 2 буде три способи:

1. **Seed-скрипт** — `npx prisma db seed` для початкового наповнення
2. **Адмін-панель** — через UI на `/admin/puzzles`
3. **API** — POST-запити на відповідні endpoints

## 9. Поточний статус

### Phase 1 (завершено)

- Scaffold Next.js 14 проєкту
- Базова структура з App Router
- Tailwind CSS з кастомною палітрою (sage, cream, terracotta)
- shadcn/ui інтеграція
- Інтернаціоналізація (uk/en) через next-intl
- Auth.js v5 підключення (UI форми входу, без логіки)
- Prisma підключення (без моделей)
- Header, Footer, Language Switcher компоненти

### Phase 2 (наступний крок)

- Моделі Prisma (User, Puzzle, Booking)
- Міграції та seed-дані
- Каталог пазлів (`/catalog`, `/catalog/[id]`)
- CRUD API для пазлів
- Робоча автентифікація з БД
- Адмін-панель (`/admin/puzzles`)
- Завантаження зображень

## 10. Локальна розробка

```bash
# Встановити залежності
npm install

# Скопіювати та заповнити .env
cp .env.example .env.local

# Запустити dev-сервер
npm run dev
```

Відкрити [http://localhost:3000](http://localhost:3000).

### Інтернаціоналізація

Мова визначається через cookie `locale`. За замовчуванням — українська (`uk`). Перемикач мови доступний у шапці сайту. Переклади зберігаються у [`src/messages/`](../src/messages/).
