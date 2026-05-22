# PuzzleShare — Документація проєкту

Платформа оренди та обміну пазлами в Україні.

Staging: https://puzzle-pi-six.vercel.app/

---

## Технологічний стек

- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **Prisma + PostgreSQL** — ORM та база даних
- **NextAuth v5** — авторизація (Credentials provider, JWT)
- **next-intl** — інтернаціоналізація (uk/en)
- **Tailwind CSS + shadcn/ui** — стилі та UI компоненти
- **Sharp** — обробка зображень
- **Vercel Blob** — зберігання зображень
- **Vercel** — хостинг та деплой

---

## Сторінки та маршрути

| URL | Що це | Доступ |
|-----|-------|--------|
| `/` | Головна (заглушка з назвою) | Публічна |
| `/catalog` | Каталог пазлів з фільтрами | Публічна |
| `/catalog/[id]` | Деталі пазла (галерея, опис, кнопка оренди) | Публічна |
| `/login` | Вхід | Публічна |
| `/admin/puzzles` | Список пазлів (адмін) | Тільки ADMIN |
| `/admin/puzzles/new` | Створити пазл | Тільки ADMIN |
| `/admin/puzzles/[id]/edit` | Редагувати пазл | Тільки ADMIN |

---

## API Endpoints

| Метод | URL | Доступ | Опис |
|-------|-----|--------|------|
| GET | `/api/puzzles` | Публічний | Список пазлів з фільтрами (category, pieces, available, search, sort, page, limit) |
| GET | `/api/puzzles/[id]` | Публічний | Деталі одного пазла |
| POST | `/api/puzzles` | Admin | Створити пазл |
| PUT | `/api/puzzles/[id]` | Admin | Оновити пазл |
| DELETE | `/api/puzzles/[id]` | Admin | Soft-delete (isVisible=false) |
| GET | `/api/categories` | Публічний | Список категорій |
| POST | `/api/upload` | Admin | Завантажити зображення (multipart, max 5 файлів по 5MB) |
| DELETE | `/api/upload` | Admin | Видалити зображення з Vercel Blob |
| POST | `/api/auth/register` | Публічний | Реєстрація (email, password, name) |
| POST | `/api/auth/signout` | Авторизований | Вихід |

---

## Моделі бази даних

- **User** — email, passwordHash, name, role (USER/ADMIN), phone, address fields
- **Category** — name, nameEn, slug
- **Puzzle** — title/titleEn, description/descriptionEn, pieceCount, condition, type, rentalPricePerDay, depositAmount, isAvailable, isVisible
- **PuzzleImage** — url, order, alt, altEn
- **Order** — status, deliveryMethod, totalAmount, depositAmount, trackingNumber
- **OrderItem** — rentalDays, pricePerDay, depositAmount
- **PuzzleTracking** — location, action, note, heldByUser
- **ActivityLog** — actorId, entityType, entityId, action, details

### Enums

| Enum | Значення |
|------|----------|
| PuzzleCondition | NEW, LIKE_NEW, GOOD, FAIR |
| PuzzleType | CLASSIC, THREE_D, FLOOR, EDUCATIONAL |
| OrderStatus | PENDING, CONFIRMED, SHIPPED, DELIVERED, RETURNED, CANCELLED |
| DeliveryMethod | NOVA_POSHTA, UKRPOSHTA, SELF_PICKUP_WAREHOUSE, SELF_PICKUP_SELLER |

---

## Структура проєкту

```
src/
├── app/
│   ├── page.tsx              — головна
│   ├── catalog/              — каталог + деталі
│   ├── admin/                — адмін панель
│   ├── login/                — логін
│   └── api/                  — API роути
├── components/               — UI компоненти
├── lib/
│   ├── auth/                 — авторизація helpers
│   ├── api/                  — schemas, serialization
│   ├── upload/               — upload constants
│   └── validation/           — Zod schemas
├── messages/                 — uk.json, en.json (i18n)
└── prisma/
    ├── schema.prisma         — схема БД
    └── seed.ts               — тестові дані
```

---

## Змінні оточення

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN=<для Vercel Blob>
```

---

## Тестові дані (Seed)

Seed створює:

- 2 користувачі:
  - `admin@puzzleshare.ua` / `admin12345` (роль ADMIN)
  - `user@puzzleshare.ua` / `user12345` (роль USER)
- 4 категорії: Пейзажі, Мистецтво, Дитячі, Міста
- 6 пазлів з зображеннями (Unsplash URLs)
- 2 замовлення, tracking записи, activity logs

Запуск:

```bash
npx prisma db seed
```

Потрібна змінна `DATABASE_URL`.

---

## Як додати дані

1. **Через адмінку** — `/admin/puzzles/new` (потрібен акаунт з роллю ADMIN)
2. **Через seed** — `npx prisma db seed` (перезаписує всі дані)
3. **Через API** — `POST /api/puzzles` (потрібен ADMIN токен в сесії)

---

## Деплой

- Vercel автоматично деплоїть при push в `main`
- Preview deploys створюються для кожного PR
- Змінні оточення налаштовуються в Vercel Dashboard → Settings → Environment Variables
- Build command: `prisma generate && next build`
- Seed НЕ запускається автоматично при деплої — потрібно запустити вручну

---

## Поточний статус

### Phase 1 — Foundation (DONE)

Prisma schema, API, каталог, деталі пазла, адмін CRUD, завантаження зображень, авторизація, деплой на Vercel.

### Phase 2 — Commerce (BACKLOG)

Кошик, checkout, оплата (Monobank), профіль користувача, управління замовленнями, нотифікації.

### Phase 3 — Integrations (BACKLOG)

Нова Пошта API, Укрпошта, Telegram бот, QR коди, інвентаризація.

### Phase 4 — Admin & Polish (BACKLOG)

Аналітика, SEO, CI/CD, performance, production deploy.

---

## Відома проблема

Головна сторінка (`/`) — це заглушка. Пазли видно на `/catalog`. Якщо каталог порожній — seed не був запущений на staging базі.
