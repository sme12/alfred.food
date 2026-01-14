# iamhungry — Веб-приложение для планирования питания

> **Scope:** MVP — генерация плана питания с AI
> **Storage:** Vercel KV (Redis)
> **Stack:** Next.js + TypeScript + Tailwind CSS + Zod + AI SDK + Claude + Vercel KV + next-intl
> **Auth:** Clerk
> **Package Manager:** pnpm

---

## Текущее состояние проекта

### ✅ Уже настроено

| Что                 | Статус                                                  |
| ------------------- | ------------------------------------------------------- |
| **Package manager** | pnpm 10.28.0 (указан в `packageManager` в package.json) |
| **Git репозиторий** | Инициализирован                                         |
| **Prettier**        | Настроен (`.prettierrc`, `.prettierignore`)             |
| **README.md**       | Базовый README с инструкциями по установке              |
| **.gitignore**      | Настроен для Node.js/pnpm проекта                       |

### 📦 Установленные зависимости

- `prettier` — форматирование кода (devDependency)

### 🔜 Нужно установить/настроить

- Next.js + TypeScript
- Tailwind CSS
- Zod
- AI SDK + Anthropic provider
- next-intl
- @use-gesture/react + @react-spring/web
- Vercel KV

---

## Упрощения для MVP

| Что            | Решение                                                                                                                                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Участники      | Хардкод: Виталик + Лена                                                                                                                                                                                                 |
| Кухни          | **Выбор в UI** (мультиселект): Восточно-европейская, Азиатская, Мексиканская, Американская, Итальянская, Средиземноморская, Японская, Тайская, Грузинская, Скандинавская. **Хардкод исключения:** индийская, непальская |
| Время готовки  | Хардкод: 30-60 мин                                                                                                                                                                                                      |
| Особые условия | Просто textarea (free text)                                                                                                                                                                                             |

**Главный UI:** Календарь недели + выбор кухонь (мультиселект) + поле для особых условий

---

## Аутентификация

**Решение:** Clerk

Аутентификация настроена через Clerk — современный auth-as-a-service провайдер.

### ✅ Уже настроено

- `@clerk/nextjs` установлен и сконфигурирован
- `ClerkProvider` обёртывает приложение в `layout.tsx`
- Middleware настроен для защиты роутов
- Переменные окружения добавлены в `.env.local`

### Основные компоненты

- `<SignIn />` / `<SignUp />` — готовые формы авторизации
- `<UserButton />` — кнопка профиля с меню
- `auth()` / `currentUser()` — серверные хелперы для получения пользователя
- `useUser()` / `useAuth()` — клиентские хуки

### Преимущества

- Защита от несанкционированного доступа к API (экономия на Claude API)
- Синхронизация данных между устройствами (один аккаунт = одни данные)
- Готовые UI-компоненты для авторизации
- Поддержка OAuth (Google, GitHub и др.)

---

## Дизайн и стиль

**Тема:** Тёмная (Dark Mode)

- Использовать тёмную цветовую схему по умолчанию
- Tailwind CSS dark-классы как основные (bg-gray-900, text-gray-100, и т.д.)
- Контрастные акцентные цвета для интерактивных элементов
- Мягкие тени и границы для разделения секций

---

## Mobile-First подход

**Приоритет:** Мобильные устройства (телефон — основной способ использования)

### Принципы

- **Viewport-first:** Все компоненты сначала проектируются для ширины 320-428px
- **Touch-friendly:** Минимальный размер тапабельных элементов — 44×44px (Apple HIG)
- **Thumb zone:** Основные действия в нижней части экрана (зона большого пальца)
- **Отзывчивость:** Немедленный визуальный feedback на все касания
- **Breakpoints:** `sm:` (640px) → `md:` (768px) → `lg:` (1024px) — расширяем, не сужаем

### Tailwind конфигурация

```css
/* Базовые стили — мобильные, расширяем через sm:/md:/lg: */
.button {
  @apply w-full py-4 text-lg; /* Mobile: full width, большие тапы */
  @apply sm:w-auto sm:py-2 sm:text-base; /* Desktop: компактнее */
}
```

### Компоненты с фокусом на mobile

| Компонент          | Mobile-оптимизация                                         |
| ------------------ | ---------------------------------------------------------- |
| `MealSlotCell`     | 48×48px минимум, ripple-эффект при тапе                    |
| `CuisineSelector`  | Горизонтальный скролл чипсов вместо сетки                  |
| `TabSwitcher`      | Sticky сверху, крупные табы на всю ширину                  |
| `WeekPagination`   | Свайп-навигация между неделями                             |
| `StickyPanel`      | Safe area padding для iPhone (env(safe-area-inset-bottom)) |
| `ShoppingListView` | **Отдельная секция ниже**                                  |

### Safe Areas (iOS)

```tsx
// layout.tsx
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

// StickyPanel.tsx
<div className="pb-[env(safe-area-inset-bottom)]">
  {/* кнопка "Новый план" */}
</div>
```

---

## Список покупок — Touch-оптимизация

**Цель:** Идеальный UX при использовании одной рукой в магазине

### Размеры элементов

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────┐                                                    │
│  │ ✓  │  Яйца — 6 шт                              [удалить] │  ← 56px высота
│  │     │  для: омлет, тосты                                 │
│  └─────┘                                                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────┐                                                    │
│  │     │  Авокадо — 2 шт                                    │  ← 56px высота
│  └─────┘                                                    │
└─────────────────────────────────────────────────────────────┘
        ↑
    48×48px чекбокс
```

### Взаимодействия

| Жест              | Действие                        |
| ----------------- | ------------------------------- |
| **Тап по строке** | Отметить как купленное (toggle) |
| **Свайп влево**   | Показать кнопку "Удалить"       |

### Свайп для удаления (Web)

Свайп работает в браузере через Touch Events API. Используем библиотеку `@use-gesture/react` (лёгкая, 3KB gzip):

```bash
npm i @use-gesture/react
```

```tsx
// components/SwipeableItem.tsx
import { useSpring, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";

const DELETE_THRESHOLD = -80; // px для показа кнопки удаления

function SwipeableShoppingItem({ item, onDelete, onToggle }: Props) {
  const [{ x }, api] = useSpring(() => ({ x: 0 }));

  const bind = useDrag(
    ({ down, movement: [mx], cancel }) => {
      // Только свайп влево
      if (mx > 0) {
        cancel();
        return;
      }

      if (down) {
        // Следуем за пальцем (с ограничением)
        api.start({ x: Math.max(mx, -100), immediate: true });
      } else {
        // Отпустили — решаем что делать
        if (mx < DELETE_THRESHOLD) {
          // Показываем кнопку удаления (фиксируем позицию)
          api.start({ x: -80 });
        } else {
          // Возвращаем назад
          api.start({ x: 0 });
        }
      }
    },
    { axis: "x", filterTaps: true },
  );

  const handleDelete = () => {
    // Анимация ухода + удаление
    api.start({
      x: -300,
      onRest: () => onDelete(item.id),
    });
  };

  return (
    <div className="relative overflow-hidden">
      {/* Кнопка удаления (под элементом) */}
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 flex items-center justify-center">
        <button onClick={handleDelete} className="text-white p-4">
          🗑️
        </button>
      </div>

      {/* Свайпаемый элемент */}
      <animated.div
        {...bind()}
        style={{ x, touchAction: "pan-y" }}
        className="relative bg-gray-800 z-10"
      >
        <ShoppingItemRow item={item} onToggle={onToggle} />
      </animated.div>
    </div>
  );
}
```

**Альтернатива без библиотек** (чистый CSS + JS):

```tsx
// Простой вариант через CSS transform + touch events
function SwipeableItem({ children, onDelete }: Props) {
  const [offsetX, setOffsetX] = useState(0);
  const [startX, setStartX] = useState(0);
  const [showDelete, setShowDelete] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientX - startX;
    if (diff < 0) setOffsetX(Math.max(diff, -100));
  };

  const handleTouchEnd = () => {
    if (offsetX < -50) {
      setOffsetX(-80);
      setShowDelete(true);
    } else {
      setOffsetX(0);
      setShowDelete(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute right-0 inset-y-0 w-20 bg-red-500 flex items-center justify-center">
        <button onClick={onDelete}>🗑️</button>
      </div>
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${offsetX}px)` }}
        className="relative bg-gray-800 transition-transform duration-150"
      >
        {children}
      </div>
    </div>
  );
}
```

### Визуальный feedback

```tsx
// ShoppingItemRow.tsx
function ShoppingItemRow({ item }: { item: ShoppingItem }) {
  const [checked, setChecked] = useState(false);

  const handleTap = () => {
    // Haptic feedback на iOS/Android
    if (navigator.vibrate) navigator.vibrate(10);
    setChecked(!checked);
  };

  return (
    <li
      onClick={handleTap}
      className={`
        flex items-center gap-4 p-4 min-h-[56px]
        rounded-xl transition-all duration-150
        active:scale-[0.98] active:bg-gray-700/50
        ${checked ? "bg-gray-800/30" : "bg-gray-800"}
      `}
    >
      {/* Большой чекбокс */}
      <div
        className={`
        w-7 h-7 rounded-lg border-2 flex items-center justify-center
        transition-colors duration-150
        ${checked ? "bg-green-500 border-green-500" : "border-gray-500"}
      `}
      >
        {checked && <CheckIcon className="w-5 h-5 text-white" />}
      </div>

      {/* Текст */}
      <div className="flex-1 min-w-0">
        <span
          className={`
          text-base transition-all duration-150
          ${checked ? "line-through text-gray-500" : "text-gray-100"}
        `}
        >
          {item.name} — {item.amount}
        </span>
        {item.forMeal && (
          <span className="block text-sm text-gray-500 truncate">
            для: {item.forMeal}
          </span>
        )}
      </div>
    </li>
  );
}
```

### Группировка по категориям

```
┌──────────────────────────────────────────────────────────────┐
│  🥛 Молочные продукты                              [свернуть]│
│  ─────────────────────────────────────────────────────────── │
│  ┌─────┐                                                     │
│  │ ✓  │  Яйца — 6 шт                                        │
│  └─────┘                                                     │
│  ┌─────┐                                                     │
│  │     │  Сливки 20% — 200 мл                               │
│  └─────┘                                                     │
├──────────────────────────────────────────────────────────────┤
│  🥬 Овощи / Фрукты                               [развернуть]│
│  ─────────────────────────────────────────────────────────── │
│  (2 из 5 куплено)                                            │
└──────────────────────────────────────────────────────────────┘
```

### Сохранение состояния чекбоксов (Vercel KV)

Состояние чекбоксов сохраняется в Vercel KV для синхронизации между устройствами (телефон в магазине ↔ ноутбук дома).

**Структура в KV:**

```
meal-planner:checked:2026-02 → ["item-id-1", "item-id-2", ...]
```

**API Route:**

```typescript
// app/api/plans/[weekKey]/checked/route.ts
import { kv } from "@vercel/kv";

// GET — получить отмеченные товары
export async function GET(
  req: Request,
  { params }: { params: { weekKey: string } },
) {
  const checked = await kv.get<string[]>(
    `meal-planner:checked:${params.weekKey}`,
  );
  return Response.json({ checked: checked ?? [] });
}

// PUT — обновить отмеченные товары
export async function PUT(
  req: Request,
  { params }: { params: { weekKey: string } },
) {
  const { checked } = await req.json();
  await kv.set(`meal-planner:checked:${params.weekKey}`, checked);
  return Response.json({ ok: true });
}
```

**Клиентский хук с debounce:**

```typescript
// hooks/useShoppingChecked.ts
import { useState, useEffect, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";

export function useShoppingChecked(planKey: string) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка при монтировании
  useEffect(() => {
    fetch(`/api/plans/${planKey}/checked`)
      .then((res) => res.json())
      .then((data) => {
        setChecked(new Set(data.checked));
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [planKey]);

  // Сохранение с debounce (300ms) для оптимизации запросов
  const saveToKV = useDebouncedCallback((checkedItems: Set<string>) => {
    fetch(`/api/plans/${planKey}/checked`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: [...checkedItems] }),
    });
  }, 300);

  const toggle = useCallback(
    (itemId: string) => {
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(itemId)) next.delete(itemId);
        else next.add(itemId);
        saveToKV(next);
        return next;
      });
    },
    [saveToKV],
  );

  return { checked, toggle, isLoading };
}
```

**Преимущества KV vs localStorage:**

- Синхронизация между устройствами (отметил на телефоне → видно на ноутбуке)
- Данные не теряются при очистке браузера
- Состояние привязано к плану, удаляется вместе с ним

### Дополнительные touch-фичи

- **Pull-to-refresh:** Обновить список (sync с KV)
- **Sticky категории:** Заголовок категории остаётся видимым при скролле
- **Floating action button:** "Скопировать непокупленное" — для отправки в мессенджер
- **Фильтр:** Показать только некупленное / всё

### Переводы для mobile UI

```json
// messages/ru.json (добавить)
{
  "shoppingList": {
    "showUnchecked": "Только некупленное",
    "showAll": "Показать всё",
    "copyUnchecked": "Скопировать список",
    "delete": "Удалить",
    "collapse": "Свернуть",
    "expand": "Развернуть"
  }
}
```

---

## Интернационализация (next-intl)

**Язык по умолчанию:** Русский (ru)
**Архитектура:** Готова к расширению на 2+ языка

### Установка

```bash
npm i next-intl
```

### Структура файлов

```
├── messages/
│   └── ru.json              # Русские переводы (основной)
│   └── en.json              # English (заготовка на будущее)
│
├── i18n/
│   ├── request.ts           # Конфигурация для Server Components
│   └── routing.ts           # Конфигурация роутинга (опционально)
│
├── app/
│   └── [locale]/            # Динамический сегмент локали
│       ├── layout.tsx
│       └── page.tsx
```

### Конфигурация

```typescript
// i18n/request.ts
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const locale = "ru"; // MVP: только русский

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

```typescript
// next.config.ts
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

export default withNextIntl({
  // остальная конфигурация
});
```

### Файл переводов

```json
// messages/ru.json
{
  "common": {
    "appName": "iamhungry",
    "generate": "Сгенерировать план",
    "save": "Сохранить",
    "regenerate": "Перегенерировать",
    "copyPrompt": "Скопировать промпт",
    "loading": "Загрузка...",
    "error": "Ошибка",
    "back": "Назад"
  },
  "navigation": {
    "newPlan": "Новый план",
    "createPlan": "Создать план"
  },
  "tabs": {
    "plan": "План",
    "shoppingList": "Список покупок"
  },
  "pagination": {
    "week": "Неделя {number}",
    "weekWithDates": "Неделя {number} ({dates})"
  },
  "emptyState": {
    "title": "Пока нет сохранённых планов",
    "description": "Создайте первый план питания на неделю"
  },
  "newPlanPage": {
    "title": "Новый план"
  },
  "calendar": {
    "title": "Расписание",
    "persons": {
      "vitalik": "Виталик",
      "lena": "Лена"
    },
    "days": {
      "mon": "Пн",
      "tue": "Вт",
      "wed": "Ср",
      "thu": "Чт",
      "fri": "Пт",
      "sat": "Сб",
      "sun": "Вс"
    },
    "meals": {
      "breakfast": "Завтрак",
      "lunch": "Обед",
      "dinner": "Ужин"
    },
    "slotHint": "Клик = смена: Полноценно → Кофе → Пропуск"
  },
  "conditions": {
    "title": "Особые условия",
    "placeholder": "Не использовать блюда: ...\nВ холодильнике есть: ...\nХочется: ..."
  },
  "result": {
    "mealPlan": "План питания",
    "shoppingList": "Список покупок",
    "minutes": "{time} мин"
  },
  "cuisines": {
    "title": "Предпочитаемые кухни",
    "eastern-european": "Восточно-европейская",
    "asian": "Азиатская",
    "mexican": "Мексиканская",
    "american": "Американская",
    "italian": "Итальянская",
    "mediterranean": "Средиземноморская",
    "japanese": "Японская",
    "thai": "Тайская",
    "georgian": "Грузинская",
    "scandinavian": "Скандинавская"
  },
  "categories": {
    "dairy": "Молочные продукты",
    "meat": "Мясо / Рыба",
    "produce": "Овощи / Фрукты",
    "pantry": "Бакалея",
    "frozen": "Заморозка",
    "bakery": "Хлеб / Выпечка",
    "condiments": "Соусы / Приправы"
  },
  "errors": {
    "generation": "Ошибка генерации плана",
    "invalidResponse": "Невалидный ответ от Claude",
    "unknown": "Неизвестная ошибка"
  },
  "prompt": {
    "role": "РОЛЬ",
    "roleDescription": "Ты — планировщик питания для семьи из {peopleCount} человек в Финляндии.",
    "mealStructure": "СТРУКТУРА ПИТАНИЯ",
    "restrictions": "ОГРАНИЧЕНИЯ ПО ПРОДУКТАМ",
    "specialConditions": "ОСОБЫЕ УСЛОВИЯ ЭТОЙ НЕДЕЛИ",
    "outputFormat": "ФОРМАТ ВЫВОДА",
    "responseLanguage": "Все названия блюд и ингредиентов — на русском языке."
  }
}
```

### Использование в компонентах

```tsx
// Server Component
import { getTranslations } from "next-intl/server";

export default async function MealPlanPage() {
  const t = await getTranslations();

  return <h1>{t("common.appName")}</h1>;
}
```

```tsx
// Client Component
"use client";
import { useTranslations } from "next-intl";

function GenerateButton() {
  const t = useTranslations("common");

  return <button>{t("generate")}</button>;
}
```

```tsx
// С параметрами
function MealCell({ time }: { time: number }) {
  const t = useTranslations("result");

  return <span>{t("minutes", { time })}</span>; // "35 мин"
}
```

### Обновлённые компоненты (без хардкода)

```tsx
// components/MealPlanResult.tsx
"use client";
import { useTranslations } from "next-intl";
import { Category } from "@/schemas/mealPlanResponse";

const CATEGORY_EMOJI: Record<Category, string> = {
  dairy: "🥛",
  meat: "🥩",
  produce: "🥬",
  pantry: "🍝",
  frozen: "❄️",
  bakery: "🥖",
  condiments: "🧂",
};

function ShoppingTripCard({ trip }: { trip: ShoppingTrip }) {
  const t = useTranslations("categories");

  return (
    <div>
      {Object.entries(byCategory).map(([category, items]) => (
        <div key={category}>
          <h4>
            {CATEGORY_EMOJI[category as Category]} {t(category)}
          </h4>
          {/* ... */}
        </div>
      ))}
    </div>
  );
}
```

```tsx
// components/WeekCalendar.tsx
"use client";
import { useTranslations } from "next-intl";
import { Day, Meal } from "@/schemas/appState";

function WeekCalendar() {
  const t = useTranslations("calendar");

  const days: Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const meals: Meal[] = ["breakfast", "lunch", "dinner"];

  return (
    <table>
      <thead>
        <tr>
          <th></th>
          {meals.map((meal) => (
            <th key={meal}>{t(`meals.${meal}`)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {days.map((day) => (
          <tr key={day}>
            <td>{t(`days.${day}`)}</td>
            {/* ... */}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Влияние языка на промпт и выдачу Claude

Язык UI влияет на:

1. **Промпт** — инструкции для Claude должны быть на языке пользователя
2. **Ответ Claude** — названия блюд, ингредиентов в shopping list

```typescript
// utils/promptBuilder.ts
import { getTranslations } from "next-intl/server";

export async function generatePrompt(
  state: AppState,
  locale: string,
): Promise<string> {
  const t = await getTranslations({ locale, namespace: "prompt" });

  return `
# ${t("role")}
${t("roleDescription", { peopleCount: 2 })}

# ${t("mealStructure")}
${scheduleSection}

# ${t("restrictions")}
${restrictionsSection}

# ${t("outputFormat")}
${t("outputFormatDescription")}
  `;
}
```

```json
// messages/ru.json (добавить секцию prompt)
{
  "prompt": {
    "role": "РОЛЬ",
    "roleDescription": "Ты — планировщик питания для семьи из {peopleCount} человек в Финляндии.",
    "mealStructure": "СТРУКТУРА ПИТАНИЯ",
    "restrictions": "ОГРАНИЧЕНИЯ ПО ПРОДУКТАМ",
    "outputFormat": "ФОРМАТ ВЫВОДА",
    "outputFormatDescription": "Верни ответ ТОЛЬКО в виде JSON...",
    "responseLanguage": "Все названия блюд и ингредиентов — на русском языке."
  }
}
```

**Важно:** В промпте явно указываем язык ответа:

```
Все названия блюд и ингредиентов — на русском языке.
```

При добавлении английского:

```json
// messages/en.json
{
  "prompt": {
    "responseLanguage": "All meal names and ingredients must be in English."
  }
}
```

### Расширение на второй язык (будущее)

1. Создать `messages/en.json` с переводами (включая секцию `prompt`)
2. Обновить `i18n/request.ts` для определения локали (cookie/header/path)
3. Добавить переключатель языка в UI
4. Передавать `locale` в `generatePrompt()`

```typescript
// i18n/request.ts (с поддержкой 2 языков)
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const locales = ["ru", "en"] as const;
type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || "ru";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

---

## User Flow и роутинг

### Структура роутов

```
/              → Главная: просмотр текущего плана
/new           → Создание нового плана (контролы + генерация)
```

### Flow

1. **Главная (`/`)** — просмотр сохранённого плана
   - Показывает последний сохранённый план (или выбранную неделю)
   - Два таба: "План" и "Список покупок"
   - Пагинация между неделями (стрелки ◀ ▶)
   - Номер недели в году для идентификации
   - Если планов нет — empty state с кнопкой создать

2. **Новый план (`/new`)** — создание плана (ДВУХЭТАПНАЯ ГЕНЕРАЦИЯ)
   - Календарь + выбор кухонь + особые условия
   - **Этап 1: Генерация плана питания**
     - Кнопка "Сгенерировать план"
     - Превью плана (без списка покупок)
     - Можно "Перегенерировать" сколько угодно раз
     - Кнопка "Подтвердить план" → переход к этапу 2
   - **Этап 2: Генерация списка покупок**
     - Автоматически запускается после подтверждения плана
     - Показывает превью списка покупок
     - Кнопки "Сохранить" / "Вернуться к плану"
   - После сохранения → редирект на `/`

3. **Sticky панель** — на главной внизу кнопка "Новый план"

### Преимущества двухэтапной генерации

- **Экономия API:** не генерируем список покупок при каждой перегенерации плана
- **Быстрее итерации:** меньше токенов в ответе = быстрее ответ
- **Лучший UX:** пользователь видит чёткое разделение процесса

---

## UI: Главная страница (/)

```
┌──────────────────────────────────────────────────────────────────┐
│ 🍽️ iamhungry                                                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  ◀  Неделя 2 (6-12 янв)  ▶                                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────┬───────────────────┐                        │
│  │ [  План  ]       │ [ Список покупок ]│  ← табы                │
│  └──────────────────┴───────────────────┘                        │
│                                                                  │
│  ╔══════════════════════════════════════════════════════════════╗│
│  ║  Таб "План":                                                 ║│
│  ║  ┌────────────────────────────────────────────────────────┐  ║│
│  ║  │      │ Завтрак              │ Обед    │ Ужин           │  ║│
│  ║  │ Пн   │ Тост с авокадо (10м) │    —    │ Курица (35м)   │  ║│
│  ║  │ Вт   │ —                    │    —    │ Тако (40м)     │  ║│
│  ║  │ Ср   │ Омлет (15м)          │    —    │ Паста (25м)    │  ║│
│  ║  │ ...  │ ...                  │   ...   │ ...            │  ║│
│  ║  └────────────────────────────────────────────────────────┘  ║│
│  ╚══════════════════════════════════════════════════════════════╝│
│                                                                  │
│  ╔══════════════════════════════════════════════════════════════╗│
│  ║  Таб "Список покупок":                                       ║│
│  ║  ┌────────────────────────────────────────────────────────┐  ║│
│  ║  │ 📦 Поход 1 (Пн-Чт)                                     │  ║│
│  ║  │                                                        │  ║│
│  ║  │ 🥛 Молочные продукты                                   │  ║│
│  ║  │ [ ] Яйца — 6 шт                                        │  ║│
│  ║  │ [ ] Сливки 20% — 200 мл                                │  ║│
│  ║  │                                                        │  ║│
│  ║  │ 🥬 Овощи / Фрукты                                      │  ║│
│  ║  │ [ ] Авокадо — 2 шт                                     │  ║│
│  ║  │ [ ] Помидоры — 4 шт                                    │  ║│
│  ║  │ ...                                                    │  ║│
│  ║  └────────────────────────────────────────────────────────┘  ║│
│  ╚══════════════════════════════════════════════════════════════╝│
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  ░░░░░░░░░░░░░░░░ STICKY PANEL ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  │                  [ + Новый план ]                           │ │
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

### Empty State (нет планов)

```
┌──────────────────────────────────────────────────────────────────┐
│ 🍽️ iamhungry                                                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│                         🍳                                        │
│                                                                  │
│              Пока нет сохранённых планов                         │
│                                                                  │
│           Создайте первый план питания на неделю                 │
│                                                                  │
│                  [ + Создать план ]                              │
│                                                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## UI: Страница создания плана (/new)

```
┌──────────────────────────────────────────────────────────────────┐
│ ← Назад               🍽️ Новый план                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌─── Виталик ─────────────────────┐                              │
│ │      │ Завтрак │ Обед │ Ужин  │                              │
│ │ Пн   │   🍽️    │  ❌  │  🍽️   │                              │
│ │ Вт   │   ☕    │  ❌  │  🍽️   │                              │
│ │ Ср   │   🍽️    │  ❌  │  🍽️   │                              │
│ │ Чт   │   ☕    │  ❌  │  🍽️   │                              │
│ │ Пт   │   🍽️    │  ❌  │  🍽️   │                              │
│ │ Сб   │   🍽️    │  🍽️  │  🍽️   │                              │
│ │ Вс   │   🍽️    │  🍽️  │  🍽️   │                              │
│ └─────────────────────────────────┘                              │
│                                                                  │
│ ┌─── Лена ───────────────────────┐                              │
│ │      │ Завтрак │ Обед │ Ужин  │                              │
│ │ Пн   │   🍽️    │  ❌  │  🍽️   │                              │
│ │ Вт   │   ☕    │  ❌  │  🍽️   │                              │
│ │ Ср   │   🍽️    │  ❌  │  🍽️   │                              │
│ │ Чт   │   ☕    │  ❌  │  🍽️   │                              │
│ │ Пт   │   ☕    │  ❌  │  🍽️   │                              │
│ │ Сб   │   🍽️    │  🍽️  │  🍽️   │                              │
│ │ Вс   │   🍽️    │  🍽️  │  🍽️   │                              │
│ └─────────────────────────────────┘                              │
│                                                                  │
│ Клик = смена: 🍽️ Полноценно → ☕ Кофе → ❌ Пропуск               │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ 🍳 Предпочитаемые кухни                                          │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ [✓] Восточно-европейская   [✓] Азиатская    [✓] Мексиканская │ │
│ │ [✓] Американская           [ ] Итальянская  [ ] Средиземном. │ │
│ │ [ ] Японская               [ ] Тайская      [ ] Грузинская   │ │
│ │ [ ] Скандинавская                                            │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ 📝 Особые условия                                                │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Не использовать блюда: карбонара, борщ (были недавно)        │ │
│ │ В холодильнике есть курица — использовать.                   │ │
│ │ Хочется чего-то острого в середине недели.                   │ │
│ │                                                              │ │
│ └──────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ═══════════════ ЭТАП 1: ПЛАН ПИТАНИЯ ═══════════════            │
│                                                                  │
│  [ 🤖 Сгенерировать план ]                                       │
│  скопировать промпт                                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  [Превью плана питания — БЕЗ списка покупок]             │    │
│  │  или [Loading spinner]                                   │    │
│  │  или [Ошибка: ...]                                       │    │
│  │                                                          │    │
│  │  [ 🔄 Перегенерировать ]  [ ✅ Подтвердить план ]        │    │
│  │  (можно перегенерировать сколько угодно раз)             │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ═══════════════ ЭТАП 2: СПИСОК ПОКУПОК ═══════════════          │
│  (появляется после подтверждения плана)                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  [Генерация списка покупок...]                           │    │
│  │  или [Превью списка покупок]                             │    │
│  │                                                          │    │
│  │  [ ← Вернуться к плану ]  [ 💾 Сохранить ]               │    │
│  │                                                          │    │
│  │  После "Сохранить" → редирект на /                       │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Loading States и Skeleton UI

Для всех асинхронных операций показываем skeleton-заглушки вместо спиннеров для лучшего UX.

### Компонент Skeleton

```tsx
// components/Skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-700 rounded ${className}`} />;
}
```

### Skeleton для плана питания

```tsx
// components/MealPlanSkeleton.tsx
export function MealPlanSkeleton() {
  return (
    <div className="space-y-4">
      {/* Заголовок недели */}
      <Skeleton className="h-8 w-48 mx-auto" />

      {/* Табы */}
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>

      {/* Таблица плана */}
      <div className="space-y-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="h-12 w-12" />
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Skeleton для списка покупок

```tsx
// components/ShoppingListSkeleton.tsx
export function ShoppingListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Категория */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="flex items-center gap-3">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-5 flex-1" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Использование в хуках

```tsx
// hooks/usePlans.ts — добавить isLoading
export function usePlans() {
  const [isLoading, setIsLoading] = useState(true);
  // ...

  return {
    // ...
    isLoading, // true пока грузится список планов
  };
}

// Пример использования на главной
function HomePage() {
  const { currentPlan, isLoading, hasPlans } = usePlans();

  if (isLoading) {
    return <MealPlanSkeleton />;
  }

  if (!hasPlans) {
    return <EmptyState />;
  }

  return <MealPlanView plan={currentPlan} />;
}
```

### Loading для генерации

```tsx
// components/GenerateSection.tsx
function GenerateSection({ isLoading, result, error }) {
  return (
    <div>
      <button disabled={isLoading}>
        {isLoading ? (
          <>
            <Spinner className="w-4 h-4 mr-2" />
            Генерируем план...
          </>
        ) : (
          "Сгенерировать план"
        )}
      </button>

      {isLoading && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <p className="text-gray-400 text-sm mb-3">
            Claude думает над вашим планом...
          </p>
          <MealPlanSkeleton />
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-900/30 border border-red-500 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {result && !isLoading && <MealPlanPreview data={result} />}
    </div>
  );
}
```

### Переводы

```json
// messages/ru.json (добавить)
{
  "loading": {
    "plans": "Загружаем планы...",
    "generating": "Claude думает над вашим планом...",
    "saving": "Сохраняем...",
    "syncing": "Синхронизация..."
  }
}
```

---

## Error Boundaries

React Error Boundaries для graceful handling ошибок в UI. Next.js App Router предоставляет встроенную поддержку через специальные файлы.

### Глобальный error boundary

```tsx
// app/error.tsx
"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    // Логируем ошибку (можно отправить в Sentry и т.п.)
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl p-6 text-center">
        <div className="text-4xl mb-4">😵</div>
        <h1 className="text-xl font-semibold text-gray-100 mb-2">
          {t("somethingWentWrong")}
        </h1>
        <p className="text-gray-400 mb-6">{t("tryAgainOrRefresh")}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
          >
            {t("tryAgain")}
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 transition-colors"
          >
            {t("goHome")}
          </button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-4 p-3 bg-red-900/30 rounded text-left text-xs text-red-300 overflow-auto">
            {error.message}
          </pre>
        )}
      </div>
    </div>
  );
}
```

### Error boundary для страницы /new

```tsx
// app/new/error.tsx
"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export default function NewPlanError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const t = useTranslations("errors");

  return (
    <div className="p-4">
      <div className="max-w-lg mx-auto bg-red-900/20 border border-red-500/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-red-400 mb-2">
          {t("planCreationError")}
        </h2>
        <p className="text-gray-300 mb-4">
          {t("planCreationErrorDescription")}
        </p>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
          >
            {t("tryAgain")}
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200"
          >
            {t("back")}
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Not Found страница

```tsx
// app/not-found.tsx
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function NotFound() {
  const t = useTranslations("errors");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🍽️</div>
        <h1 className="text-2xl font-bold text-gray-100 mb-2">404</h1>
        <p className="text-gray-400 mb-6">{t("pageNotFound")}</p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white inline-block"
        >
          {t("goHome")}
        </Link>
      </div>
    </div>
  );
}
```

### Переводы для ошибок

```json
// messages/ru.json (расширить секцию errors)
{
  "errors": {
    "generation": "Ошибка генерации плана",
    "invalidResponse": "Невалидный ответ от Claude",
    "unknown": "Неизвестная ошибка",
    "somethingWentWrong": "Что-то пошло не так",
    "tryAgainOrRefresh": "Попробуйте ещё раз или обновите страницу",
    "tryAgain": "Попробовать снова",
    "goHome": "На главную",
    "back": "Назад",
    "planCreationError": "Ошибка создания плана",
    "planCreationErrorDescription": "Не удалось загрузить форму создания плана. Попробуйте обновить страницу.",
    "pageNotFound": "Страница не найдена"
  }
}
```

### Обработка ошибок в компонентах

Для более гранулярной обработки ошибок (например, только в списке покупок) можно использовать React Error Boundary напрямую:

```tsx
// components/ErrorBoundary.tsx
"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Использование
<ErrorBoundary fallback={<ShoppingListError />}>
  <ShoppingListView items={items} />
</ErrorBoundary>;
```

---

## Модель данных (Zod)

```typescript
import { z } from "zod";

// Статусы ячеек календаря
export const MealSlotStatusSchema = z.enum([
  "full", // 🍽️ Полноценный приём пищи (готовим дома)
  "coffee", // ☕ Лёгкий перекус (кофе/круассан)
  "skip", // ❌ Пропуск
]);
export type MealSlotStatus = z.infer<typeof MealSlotStatusSchema>;

// Дни недели
export const DaySchema = z.enum([
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
]);
export type Day = z.infer<typeof DaySchema>;

// Приёмы пищи
export const MealSchema = z.enum(["breakfast", "lunch", "dinner"]);
export type Meal = z.infer<typeof MealSchema>;

// Расписание одного человека на день
export const DayScheduleSchema = z.object({
  breakfast: MealSlotStatusSchema,
  lunch: MealSlotStatusSchema,
  dinner: MealSlotStatusSchema,
});
export type DaySchedule = z.infer<typeof DayScheduleSchema>;

// Расписание одного человека на неделю
export const PersonWeekScheduleSchema = z.record(DaySchema, DayScheduleSchema);
export type PersonWeekSchedule = z.infer<typeof PersonWeekScheduleSchema>;

// Идентификаторы кухонь
export const CuisineIdSchema = z.enum([
  "eastern-european",
  "asian",
  "mexican",
  "american",
  "italian",
  "mediterranean",
  "japanese",
  "thai",
  "georgian",
  "scandinavian",
]);
export type CuisineId = z.infer<typeof CuisineIdSchema>;

// Полное состояние приложения
export const AppStateSchema = z.object({
  schedules: z.object({
    vitalik: PersonWeekScheduleSchema,
    lena: PersonWeekScheduleSchema,
  }),
  selectedCuisines: z.array(CuisineIdSchema),
  specialConditions: z.string(),
});
export type AppState = z.infer<typeof AppStateSchema>;

// Валидация при загрузке из Vercel KV
export function parseAppState(data: unknown): AppState | null {
  const result = AppStateSchema.safeParse(data);
  return result.success ? result.data : null;
}
```

### Преимущества Zod

1. **Единый источник правды** — схема = тип
2. **Валидация данных из KV** — `safeParse` вернёт `null` если данные битые
3. **Автодополнение** — TypeScript знает все возможные значения enum'ов
4. **Рефакторинг** — изменил схему → TypeScript покажет все места для исправления

---

## Генерация промпта

На основе контролов система автоматически генерирует структуру промпта:

1. **Считаем порции** — для каждого слота: сколько человек ест дома
2. **Определяем тип приёма** — обычный/большой/быстрый
3. **Исключаем слоты** — где никто не ест дома
4. **Добавляем особые условия** — гости, остатки, пожелания

---

## Структура проекта (Next.js App Router)

```
├── messages/
│   └── ru.json                   # Переводы (русский)
│
├── i18n/
│   └── request.ts                # Конфигурация next-intl
│
├── lib/
│   └── rateLimit.ts              # Rate limiting через Vercel KV
│
├── app/
│   ├── layout.tsx                # NextIntlClientProvider
│   ├── page.tsx                  # Главная: просмотр планов + табы
│   ├── error.tsx                 # Глобальный error boundary
│   ├── not-found.tsx             # 404 страница
│   ├── new/
│   │   ├── page.tsx              # Создание нового плана
│   │   └── error.tsx             # Error boundary для /new
│   └── api/
│       ├── generate-meal-plan/
│       │   └── route.ts          # Этап 1: генерация плана питания (без списка покупок)
│       ├── generate-shopping-list/
│       │   └── route.ts          # Этап 2: генерация списка покупок (после подтверждения плана)
│       ├── regenerate-meals/
│       │   └── route.ts          # Частичная перегенерация отдельных блюд
│       └── plans/
│           ├── route.ts          # GET: список планов, POST: сохранить план
│           └── [weekKey]/
│               ├── route.ts      # GET: конкретный план по ключу
│               └── checked/
│                   └── route.ts  # GET/PUT: состояние чекбоксов
│
├── components/
│   ├── WeekCalendar.tsx          # Сетка расписания (для /new)
│   ├── PersonScheduleRow.tsx     # Строка для одного человека
│   ├── MealSlotCell.tsx          # Кликабельная ячейка
│   ├── CuisineSelector.tsx       # Мультиселект кухонь
│   ├── SpecialConditions.tsx     # Textarea для особых условий
│   ├── GenerateSection.tsx       # Кнопка генерации + превью
│   ├── MealPlanView.tsx          # Отображение плана (read-only, для /)
│   ├── ShoppingListView.tsx      # Список покупок с чекбоксами
│   ├── WeekPagination.tsx        # Пагинация между неделями
│   ├── TabSwitcher.tsx           # Переключатель План / Список
│   ├── EmptyState.tsx            # Пустое состояние (нет планов)
│   ├── StickyPanel.tsx           # Sticky панель с кнопкой "Новый план"
│   ├── ErrorBoundary.tsx         # Компонент для обработки ошибок
│   └── Skeleton.tsx              # Skeleton-заглушки для loading states
│
├── hooks/
│   ├── useSchedule.ts            # Состояние календаря (для /new)
│   ├── usePlans.ts               # Загрузка/навигация по планам
│   └── useMealPlanGeneration.ts  # Вызов API + состояние
│
├── config/
│   └── defaults.ts               # Хардкод: люди, кухни, ограничения
│
├── schemas/
│   ├── appState.ts               # Zod-схемы состояния (для /new)
│   ├── mealPlanResponse.ts       # Zod-схема ответа Claude
│   └── persistedPlan.ts          # Zod-схемы для сохранённых планов
│
└── utils/
    ├── promptBuilder.ts          # Сборка промпта
    ├── weekNumber.ts             # Утилиты для работы с номером недели
    └── shoppingItemId.ts         # Генерация стабильных ID для товаров
```

### Хардкод-конфиг (defaults.ts)

```typescript
export const PEOPLE = ["Виталик", "Лена"] as const;

// Все доступные кухни для выбора в UI
export const AVAILABLE_CUISINES = [
  "eastern-european",
  "asian",
  "mexican",
  "american",
  "italian",
  "mediterranean",
  "japanese",
  "thai",
  "georgian",
  "scandinavian",
] as const;

export type CuisineId = (typeof AVAILABLE_CUISINES)[number];

// Дефолтный выбор (предвыбранные при первом заходе)
export const DEFAULT_SELECTED_CUISINES: CuisineId[] = [
  "eastern-european",
  "asian",
  "mexican",
  "american",
];

// Явно исключаем — хардкод, не показываем в UI
export const EXCLUDED_CUISINES = ["Индийская", "Непальская"];

export const COOKING_TIME = {
  optimal: 30, // минут
  max: 60,
};

export const BANNED_INGREDIENTS = [
  "Морковный крем-суп",
  "минестроне",
  "Гречка",
  "овсянка",
  "Чернослив",
  "курага",
  "сухофрукты",
  "Овощные запеканки",
  "Батат",
  "Чечевичные и фасолевые супы",
  "Каперсы",
];

export const MEAT_RULES = {
  pork: "только бекон",
  beef: "максимум 1 раз в неделю",
  fish: "только лосось/форель/тунец, максимум 1 раз в неделю",
};
```

---

## UI-компонент: CuisineSelector

```tsx
// components/CuisineSelector.tsx
"use client";
import { useTranslations } from "next-intl";
import { AVAILABLE_CUISINES, CuisineId } from "@/config/defaults";

interface CuisineSelectorProps {
  selected: CuisineId[];
  onChange: (cuisines: CuisineId[]) => void;
}

export function CuisineSelector({ selected, onChange }: CuisineSelectorProps) {
  const t = useTranslations("cuisines");

  const toggle = (id: CuisineId) => {
    if (selected.includes(id)) {
      onChange(selected.filter((c) => c !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3 text-gray-100">{t("title")}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {AVAILABLE_CUISINES.map((id) => (
          <label
            key={id}
            className={`
              flex items-center gap-2 p-2 rounded-lg cursor-pointer
              transition-colors border
              ${
                selected.includes(id)
                  ? "bg-blue-900/50 border-blue-500"
                  : "bg-gray-800 border-gray-700 hover:border-gray-600"
              }
            `}
          >
            <input
              type="checkbox"
              checked={selected.includes(id)}
              onChange={() => toggle(id)}
              className="rounded text-blue-500"
            />
            <span className="text-gray-200">{t(id)}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
```

---

## Ключевой UI-компонент: MealSlotCell

```tsx
// Клик по ячейке циклически меняет статус
const statusCycle: MealSlotStatus[] = [
  "full", // 🍽️ Полноценный приём пищи
  "coffee", // ☕ Лёгкий перекус
  "skip", // ❌ Пропуск
];

function MealSlotCell({ status, onChange }) {
  const nextStatus = () => {
    const idx = statusCycle.indexOf(status);
    onChange(statusCycle[(idx + 1) % statusCycle.length]);
  };

  return (
    <button onClick={nextStatus} className="...">
      {statusEmoji[status]}
    </button>
  );
}
```

---

## Алгоритм генерации промпта

```typescript
function generatePrompt(
  state: AppState,
  previousPlan: MealPlanResponse | null,
): string {
  const { people, preferences, weekSchedule, conditions } = state;

  // 1. Считаем порции для каждого слота
  const mealPlan = calculateMealRequirements(weekSchedule);

  // 2. Формируем секцию "Структура питания"
  const scheduleSection = formatScheduleSection(mealPlan);

  // 3. Добавляем ограничения
  const restrictionsSection = formatRestrictions(preferences);

  // 4. Добавляем условия недели
  const conditionsSection = formatConditions(conditions);

  // 5. Извлекаем блюда из прошлого плана для исключения
  const previousMealsSection = formatPreviousMeals(previousPlan);

  return `
# РОЛЬ
Ты — планировщик питания для семьи из ${people.length} человек в Финляндии.

# СТРУКТУРА ПИТАНИЯ
${scheduleSection}

# ОГРАНИЧЕНИЯ ПО ПРОДУКТАМ
${restrictionsSection}

# НЕ ПОВТОРЯТЬ БЛЮДА ИЗ ПРОШЛОГО ПЛАНА
${previousMealsSection}

# ОСОБЫЕ УСЛОВИЯ ЭТОЙ НЕДЕЛИ
${conditionsSection}

# ФОРМАТ ВЫВОДА
${OUTPUT_FORMAT_JSON}
  `;
}

// Извлекает названия блюд из предыдущего плана
function formatPreviousMeals(plan: MealPlanResponse | null): string {
  if (!plan) return "Нет данных о прошлом плане.";

  const meals = plan.weekPlan
    .flatMap((day) => [day.breakfast, day.lunch, day.dinner])
    .filter((meal): meal is MealItem => meal !== null)
    .map((meal) => meal.name);

  const uniqueMeals = [...new Set(meals)];

  if (uniqueMeals.length === 0) return "Нет данных о прошлом плане.";

  return `Следующие блюда были в прошлом плане — НЕ используй их:\n${uniqueMeals
    .map((m) => `- ${m}`)
    .join("\n")}`;
}
```

---

## Формат вывода: JSON (Двухэтапная генерация)

Claude возвращает структурированный JSON, который мы парсим и рендерим сами. Это даёт полный контроль над UI и позволяет валидировать ответ через Zod.

**ВАЖНО:** Генерация разделена на два этапа:
1. **Этап 1:** Генерация плана питания (без списка покупок)
2. **Этап 2:** Генерация списка покупок (на основе подтверждённого плана)

Это позволяет пользователю перегенерировать план несколько раз без лишних API-вызовов для списка покупок.

### Zod-схемы ответов

```typescript
// schemas/mealPlanResponse.ts
import { z } from "zod";

// Блюдо
export const MealItemSchema = z.object({
  name: z.string(),
  time: z.number(), // минуты
  portions: z.number(),
});
export type MealItem = z.infer<typeof MealItemSchema>;

// День в плане питания
export const DayPlanSchema = z.object({
  day: z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
  breakfast: MealItemSchema.nullable(),
  lunch: MealItemSchema.nullable(),
  dinner: MealItemSchema.nullable(),
});
export type DayPlan = z.infer<typeof DayPlanSchema>;

// Категории продуктов
export const CategorySchema = z.enum([
  "dairy", // 🥛 Молочные продукты
  "meat", // 🥩 Мясо / Рыба
  "produce", // 🥬 Овощи / Фрукты
  "pantry", // 🍝 Бакалея
  "frozen", // ❄️ Заморозка
  "bakery", // 🥖 Хлеб / Выпечка
  "condiments", // 🧂 Соусы / Приправы
]);
export type Category = z.infer<typeof CategorySchema>;

// Элемент списка покупок
export const ShoppingItemSchema = z.object({
  name: z.string(),
  amount: z.string(),
  category: CategorySchema,
  forMeal: z.string().optional(), // для какого блюда
});
export type ShoppingItem = z.infer<typeof ShoppingItemSchema>;

// Элемент с ID (для клиента, после обработки)
export const ShoppingItemWithIdSchema = ShoppingItemSchema.extend({
  id: z.string(), // детерминированный ID для сохранения состояния чекбоксов
});
export type ShoppingItemWithId = z.infer<typeof ShoppingItemWithIdSchema>;

// Поход в магазин
export const ShoppingTripSchema = z.object({
  label: z.string(), // "Поход 1 (Пн-Чт)"
  items: z.array(ShoppingItemSchema),
});
export type ShoppingTrip = z.infer<typeof ShoppingTripSchema>;

// ============================================
// Этап 1: Только план питания (без списка покупок)
// ============================================
export const MealPlanOnlyResponseSchema = z.object({
  weekPlan: z.array(DayPlanSchema),
});
export type MealPlanOnlyResponse = z.infer<typeof MealPlanOnlyResponseSchema>;

export function parseMealPlanOnlyResponse(data: unknown): MealPlanOnlyResponse | null {
  const result = MealPlanOnlyResponseSchema.safeParse(data);
  return result.success ? result.data : null;
}

// ============================================
// Этап 2: Только список покупок (после подтверждения плана)
// ============================================
export const ShoppingListResponseSchema = z.object({
  shoppingTrips: z.array(ShoppingTripSchema),
});
export type ShoppingListResponse = z.infer<typeof ShoppingListResponseSchema>;

export function parseShoppingListResponse(data: unknown): ShoppingListResponse | null {
  const result = ShoppingListResponseSchema.safeParse(data);
  return result.success ? result.data : null;
}

// ============================================
// Полный ответ (для сохранённых планов)
// ============================================
export const MealPlanResponseSchema = z.object({
  weekPlan: z.array(DayPlanSchema),
  shoppingTrips: z.array(ShoppingTripSchema),
});
export type MealPlanResponse = z.infer<typeof MealPlanResponseSchema>;

export function parseMealPlanResponse(data: unknown): MealPlanResponse | null {
  const result = MealPlanResponseSchema.safeParse(data);
  return result.success ? result.data : null;
}
```

### Инструкция для промпта — Этап 1: План питания

```
# ФОРМАТ ВЫВОДА

Верни ответ ТОЛЬКО в виде JSON (без markdown-блока, без пояснений).
НЕ включай список покупок — только план питания.

Структура:

{
  "weekPlan": [
    {
      "day": "mon",
      "breakfast": { "name": "Тост с авокадо и яйцом", "time": 10, "portions": 2 },
      "lunch": null,
      "dinner": { "name": "Куриная грудка с овощами", "time": 35, "portions": 2 }
    },
    {
      "day": "tue",
      "breakfast": null,
      "lunch": null,
      "dinner": { "name": "Тако с говядиной", "time": 40, "portions": 2 }
    }
    // ... остальные дни
  ]
}

ПРАВИЛА:
- day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"
- null для пропущенных приёмов пищи
- time: время приготовления в минутах (число)
- portions: количество порций (число)
```

### Инструкция для промпта — Этап 2: Список покупок

```
# ФОРМАТ ВЫВОДА

Верни ответ ТОЛЬКО в виде JSON (без markdown-блока, без пояснений).
Сгенерируй список покупок на основе предоставленного плана питания.

Структура:

{
  "shoppingTrips": [
    {
      "label": "Поход 1 (Пн-Чт)",
      "items": [
        { "name": "Яйца", "amount": "6 шт", "category": "dairy" },
        { "name": "Авокадо", "amount": "2 шт", "category": "produce" },
        { "name": "Куриное филе", "amount": "400 г", "category": "meat" },
        { "name": "Сливки 20%", "amount": "200 мл", "category": "dairy", "forMeal": "карбонара" }
      ]
    },
    {
      "label": "Поход 2 (Пт-Вс)",
      "items": [
        // ...
      ]
    }
  ]
}

ПРАВИЛА:
- category: "dairy" | "meat" | "produce" | "pantry" | "frozen" | "bakery" | "condiments"
- forMeal: опционально, если ингредиент нужен для конкретного блюда
- Группируй покупки по 2 похода: Пн-Чт и Пт-Вс
- Объединяй одинаковые ингредиенты (суммируй количество)
```

### Категории продуктов

| Категория         | Эмодзи | ID         |
| ----------------- | ------ | ---------- |
| Молочные продукты | 🥛     | dairy      |
| Мясо / Рыба       | 🥩     | meat       |
| Овощи / Фрукты    | 🥬     | produce    |
| Бакалея           | 🍝     | pantry     |
| Заморозка         | ❄️     | frozen     |
| Хлеб / Выпечка    | 🥖     | bakery     |
| Соусы / Приправы  | 🧂     | condiments |

### Рендеринг в React

```tsx
// components/MealPlanResult.tsx
import { MealPlanResponse, Category } from "../schemas/mealPlanResponse";

const CATEGORY_EMOJI: Record<Category, string> = {
  dairy: "🥛",
  meat: "🥩",
  produce: "🥬",
  pantry: "🍝",
  frozen: "❄️",
  bakery: "🥖",
  condiments: "🧂",
};

const CATEGORY_LABELS: Record<Category, string> = {
  dairy: "Молочные продукты",
  meat: "Мясо / Рыба",
  produce: "Овощи / Фрукты",
  pantry: "Бакалея",
  frozen: "Заморозка",
  bakery: "Хлеб / Выпечка",
  condiments: "Соусы / Приправы",
};

const DAY_LABELS: Record<string, string> = {
  mon: "Пн",
  tue: "Вт",
  wed: "Ср",
  thu: "Чт",
  fri: "Пт",
  sat: "Сб",
  sun: "Вс",
};

function MealPlanResult({ data }: { data: MealPlanResponse }) {
  return (
    <div className="space-y-8">
      {/* План питания */}
      <section>
        <h2 className="text-xl font-semibold mb-4">План питания</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-3 text-left">День</th>
                <th className="border p-3 text-left">Завтрак</th>
                <th className="border p-3 text-left">Обед</th>
                <th className="border p-3 text-left">Ужин</th>
              </tr>
            </thead>
            <tbody>
              {data.weekPlan.map((day) => (
                <tr key={day.day}>
                  <td className="border p-3 font-medium">
                    {DAY_LABELS[day.day]}
                  </td>
                  <MealCell meal={day.breakfast} />
                  <MealCell meal={day.lunch} />
                  <MealCell meal={day.dinner} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Списки покупок */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Список покупок</h2>
        {data.shoppingTrips.map((trip, idx) => (
          <ShoppingTripCard key={idx} trip={trip} />
        ))}
      </section>
    </div>
  );
}

function MealCell({ meal }: { meal: MealItem | null }) {
  if (!meal) {
    return <td className="border p-3 text-gray-400">—</td>;
  }
  return (
    <td className="border p-3">
      <div className="font-medium">{meal.name}</div>
      <div className="text-sm text-gray-500">{meal.time} мин</div>
    </td>
  );
}

function ShoppingTripCard({ trip }: { trip: ShoppingTrip }) {
  // Группируем по категориям
  const byCategory = trip.items.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<Category, ShoppingItem[]>,
  );

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-3">{trip.label}</h3>
      {Object.entries(byCategory).map(([category, items]) => (
        <div key={category} className="mb-3">
          <h4 className="text-sm font-medium text-gray-600 mb-1">
            {CATEGORY_EMOJI[category as Category]}{" "}
            {CATEGORY_LABELS[category as Category]}
          </h4>
          <ul className="space-y-1">
            {items.map((item, idx) => (
              <ShoppingItemRow key={idx} item={item} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ShoppingItemRow({ item }: { item: ShoppingItem }) {
  const [checked, setChecked] = useState(false);
  return (
    <li className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="rounded"
      />
      <span className={checked ? "line-through text-gray-400" : ""}>
        {item.name} — {item.amount}
        {item.forMeal && (
          <span className="text-gray-400 text-sm"> ({item.forMeal})</span>
        )}
      </span>
    </li>
  );
}
```

---

## Интеграция с AI SDK (Claude напрямую) — Двухэтапная генерация

Вместо ручного копирования промпта — генерация плана прямо в приложении через AI SDK от Vercel с прямым подключением к Anthropic API.

**ВАЖНО:** Генерация разделена на два этапа:
1. `/api/generate-meal-plan` — генерирует только план питания (без списка покупок)
2. `/api/generate-shopping-list` — генерирует список покупок для подтверждённого плана

### Установка

```bash
npm i ai @ai-sdk/anthropic use-debounce next-intl
```

### Переменные окружения

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
```

### API Route — Этап 1: Генерация плана питания

```typescript
// app/api/generate-meal-plan/route.ts
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { kv } from "@vercel/kv";
import { MealPlanOnlyResponseSchema } from "@/schemas/mealPlanResponse";
import { PersistedPlanSchema } from "@/schemas/persistedPlan";
import { generateMealPlanPrompt } from "@/utils/promptBuilder";
import { AppStateSchema } from "@/schemas/appState";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Валидация входных данных
    const stateResult = AppStateSchema.safeParse(body.state);
    if (!stateResult.success) {
      return Response.json(
        {
          error: "Невалидные данные запроса",
          details: stateResult.error.flatten(),
        },
        { status: 400 },
      );
    }
    const state = stateResult.data;

    // Получаем последний сохранённый план из KV для исключения повторов
    const planKeys = await kv.zrange<string[]>(
      "meal-planner:plan-index",
      -1,
      -1,
    );
    let previousPlan = null;
    if (planKeys && planKeys.length > 0) {
      const lastPlanRaw = await kv.get(`meal-planner:plan:${planKeys[0]}`);
      const parsed = PersistedPlanSchema.safeParse(lastPlanRaw);
      previousPlan = parsed.success ? parsed.data : null;
    }

    // Генерируем промпт для ПЛАНА ПИТАНИЯ (без списка покупок)
    const prompt = generateMealPlanPrompt(state, previousPlan);

    const result = await generateObject({
      model: anthropic("claude-sonnet-4-20250514"),
      schema: MealPlanOnlyResponseSchema, // Только weekPlan, без shoppingTrips
      prompt,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error("Meal plan generation failed:", error);

    // Обработка специфичных ошибок Claude/AI SDK
    if (error instanceof Error) {
      if (error.message?.includes("rate_limit")) {
        return Response.json(
          { error: "Слишком много запросов. Подождите минуту." },
          { status: 429 },
        );
      }
      if (error.message?.includes("content_filter")) {
        return Response.json(
          { error: "Запрос отклонён фильтром контента." },
          { status: 400 },
        );
      }
      if (error.message?.includes("invalid_api_key")) {
        return Response.json(
          { error: "Ошибка конфигурации API." },
          { status: 500 },
        );
      }
    }

    return Response.json(
      { error: "Ошибка генерации плана. Попробуйте ещё раз." },
      { status: 500 },
    );
  }
}
```

### API Route — Этап 2: Генерация списка покупок

```typescript
// app/api/generate-shopping-list/route.ts
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { ShoppingListResponseSchema, MealPlanOnlyResponseSchema } from "@/schemas/mealPlanResponse";
import { generateShoppingListPrompt } from "@/utils/promptBuilder";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Валидация входных данных — принимаем подтверждённый план
    const planResult = MealPlanOnlyResponseSchema.safeParse(body.weekPlan);
    if (!planResult.success) {
      return Response.json(
        {
          error: "Невалидный план питания",
          details: planResult.error.flatten(),
        },
        { status: 400 },
      );
    }
    const weekPlan = planResult.data;

    // Генерируем промпт для СПИСКА ПОКУПОК на основе плана
    const prompt = generateShoppingListPrompt(weekPlan);

    const result = await generateObject({
      model: anthropic("claude-sonnet-4-20250514"),
      schema: ShoppingListResponseSchema, // Только shoppingTrips
      prompt,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error("Shopping list generation failed:", error);

    if (error instanceof Error) {
      if (error.message?.includes("rate_limit")) {
        return Response.json(
          { error: "Слишком много запросов. Подождите минуту." },
          { status: 429 },
        );
      }
    }

    return Response.json(
      { error: "Ошибка генерации списка покупок. Попробуйте ещё раз." },
      { status: 500 },
    );
  }
}
```

### Клиентский хук — Двухэтапная генерация

```typescript
// hooks/useMealPlanGeneration.ts
import { useState } from "react";
import {
  MealPlanOnlyResponse,
  ShoppingListResponse,
  MealPlanResponse,
  parseMealPlanOnlyResponse,
  parseShoppingListResponse,
} from "@/schemas/mealPlanResponse";
import { AppState } from "@/schemas/appState";

type GenerationStage = "idle" | "generating-plan" | "plan-ready" | "generating-shopping" | "complete";

export function useMealPlanGeneration() {
  const [stage, setStage] = useState<GenerationStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlanOnlyResponse | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingListResponse | null>(null);

  // Этап 1: Генерация плана питания
  const generatePlan = async (state: AppState) => {
    setStage("generating-plan");
    setError(null);

    try {
      const res = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка генерации плана");
      }

      const data = await res.json();
      const parsed = parseMealPlanOnlyResponse(data);

      if (!parsed) {
        throw new Error("Невалидный ответ от Claude");
      }

      setMealPlan(parsed);
      setStage("plan-ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неизвестная ошибка");
      setStage("idle");
    }
  };

  // Этап 2: Генерация списка покупок (после подтверждения плана)
  const generateShoppingList = async () => {
    if (!mealPlan) {
      setError("Сначала нужно сгенерировать план питания");
      return;
    }

    setStage("generating-shopping");
    setError(null);

    try {
      const res = await fetch("/api/generate-shopping-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekPlan: mealPlan }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка генерации списка покупок");
      }

      const data = await res.json();
      const parsed = parseShoppingListResponse(data);

      if (!parsed) {
        throw new Error("Невалидный ответ от Claude");
      }

      setShoppingList(parsed);
      setStage("complete");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неизвестная ошибка");
      setStage("plan-ready"); // Возвращаемся к подтверждённому плану
    }
  };

  // Сброс для повторной генерации плана
  const resetToPlanStage = () => {
    setShoppingList(null);
    setStage("plan-ready");
    setError(null);
  };

  // Полный сброс
  const reset = () => {
    setMealPlan(null);
    setShoppingList(null);
    setStage("idle");
    setError(null);
  };

  // Полный результат для сохранения
  const getCompleteResult = (): MealPlanResponse | null => {
    if (!mealPlan || !shoppingList) return null;
    return {
      weekPlan: mealPlan.weekPlan,
      shoppingTrips: shoppingList.shoppingTrips,
    };
  };

  return {
    // Состояние
    stage,
    error,
    mealPlan,
    shoppingList,

    // Флаги для UI
    isGeneratingPlan: stage === "generating-plan",
    isGeneratingShopping: stage === "generating-shopping",
    isPlanReady: stage === "plan-ready" || stage === "generating-shopping" || stage === "complete",
    isComplete: stage === "complete",

    // Действия
    generatePlan,
    generateShoppingList,
    resetToPlanStage,
    reset,
    getCompleteResult,
  };
}
```

### Преимущества двухэтапной генерации

1. **Экономия API-вызовов** — не генерируем список покупок при каждой перегенерации плана
2. **Быстрее итерации** — меньше токенов в ответе = быстрее ответ от Claude
3. **Лучший UX** — пользователь видит чёткое разделение процесса
4. **Меньше токенов** — один запрос плана ≈ 1-1.5K токенов вместо 2-3K

### Стоимость

Claude Sonnet 4: ~$3/$15 за 1M токенов (input/output).
- Генерация плана питания ≈ 1-1.5K токенов → **~$0.005-0.01**
- Генерация списка покупок ≈ 1-1.5K токенов → **~$0.005-0.01**
- **Итого за полный цикл:** ~$0.01-0.02
- **При 3 перегенерациях плана:** ~$0.02-0.04 (вместо ~$0.03-0.06 при старом подходе)

---

## Rate Limiting

Защита от злоупотребления API (даже авторизованными пользователями). Используем Vercel KV для хранения счётчиков.

### Middleware для rate limiting

```typescript
// lib/rateLimit.ts
import { kv } from "@vercel/kv";

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number; // секунд до сброса
}

/**
 * Проверяет rate limit для пользователя.
 * @param identifier - уникальный идентификатор (IP или user ID)
 * @param limit - максимум запросов
 * @param windowSeconds - окно времени в секундах
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60,
): Promise<RateLimitResult> {
  const key = `rate:${identifier}`;

  // Атомарно увеличиваем счётчик
  const current = await kv.incr(key);

  // Если это первый запрос — устанавливаем TTL
  if (current === 1) {
    await kv.expire(key, windowSeconds);
  }

  // Получаем оставшееся время
  const ttl = await kv.ttl(key);

  return {
    success: current <= limit,
    remaining: Math.max(0, limit - current),
    resetIn: ttl > 0 ? ttl : windowSeconds,
  };
}
```

### Использование в API routes

```typescript
// app/api/generate-meal-plan/route.ts
import { checkRateLimit } from "@/lib/rateLimit";
import { headers } from "next/headers";

export async function POST(req: Request) {
  // Получаем IP (или другой идентификатор)
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  // Проверяем rate limit: 10 генераций в минуту
  const rateLimit = await checkRateLimit(`generate:${ip}`, 10, 60);

  if (!rateLimit.success) {
    return Response.json(
      {
        error: "Слишком много запросов. Попробуйте снова через минуту.",
        retryAfter: rateLimit.resetIn,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.resetIn),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      },
    );
  }

  // ... остальная логика генерации
}
```

### Лимиты для разных операций

| Операция           | Лимит | Окно  | Причина                           |
| ------------------ | ----- | ----- | --------------------------------- |
| Генерация плана    | 10    | 1 мин | Дорогой вызов Claude API          |
| Перегенерация блюд | 20    | 1 мин | Меньше токенов, но всё ещё дорого |
| Сохранение плана   | 30    | 1 мин | Дёшево, но защита от спама        |
| Toggle чекбокса    | 100   | 1 мин | Часто используется, высокий лимит |

### Клиентская обработка 429

```typescript
// hooks/useMealPlanGeneration.ts
const generate = async (state: AppState) => {
    setIsLoading(true);
    setError(null);

    try {
        const res = await fetch('/api/generate-meal-plan', { ... });

        if (res.status === 429) {
            const data = await res.json();
            const retryAfter = data.retryAfter || 60;
            setError(`Слишком много запросов. Подождите ${retryAfter} сек.`);
            return;
        }

        // ... остальная обработка
    } catch (e) { ... }
};
```

---

## Интеграция с Vercel KV

### Установка

```bash
npm i @vercel/kv
```

### Переменные окружения

```bash
# .env.local (автоматически добавляются при создании KV в dashboard)
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

### Zod-схемы для персистентности

```typescript
// schemas/persistedPlan.ts
import { z } from "zod";
import { MealPlanResponseSchema } from "./mealPlanResponse";

// Сохранённый план с метаданными
export const PersistedPlanSchema = MealPlanResponseSchema.extend({
  weekNumber: z.number(), // Номер недели в году (1-53)
  year: z.number(), // Год
  weekStart: z.string(), // Дата начала недели (ISO, для отображения "6-12 янв")
  weekEnd: z.string(), // Дата конца недели
  savedAt: z.string().datetime(), // Когда сохранён
});
export type PersistedPlan = z.infer<typeof PersistedPlanSchema>;

// Список планов (для пагинации)
export const PlansListSchema = z.object({
  plans: z.array(
    z.object({
      weekNumber: z.number(),
      year: z.number(),
      weekStart: z.string(),
      weekEnd: z.string(),
      savedAt: z.string().datetime(),
    }),
  ),
  total: z.number(),
});
export type PlansList = z.infer<typeof PlansListSchema>;
```

### Утилиты для работы с неделями

```typescript
// utils/weekNumber.ts
import { getISOWeek, startOfISOWeek, endOfISOWeek, format } from "date-fns";
import { ru } from "date-fns/locale";

export function getCurrentWeekInfo() {
  const now = new Date();
  const weekNumber = getISOWeek(now);
  const year = now.getFullYear();
  const weekStart = startOfISOWeek(now);
  const weekEnd = endOfISOWeek(now);

  return {
    weekNumber,
    year,
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
  };
}

export function formatWeekRange(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart);
  const end = new Date(weekEnd);
  // "6-12 янв" или "28 дек - 3 янв"
  return `${format(start, "d", { locale: ru })}-${format(end, "d MMM", {
    locale: ru,
  })}`;
}

// Уникальный ключ для плана: "2026-02" (год-неделя)
export function getPlanKey(year: number, weekNumber: number): string {
  return `${year}-${String(weekNumber).padStart(2, "0")}`;
}
```

### Генерация стабильных ID для товаров

Для корректной работы чекбоксов в списке покупок нужны стабильные ID, которые не меняются при перегенерации плана (если товар тот же).

```typescript
// utils/shoppingItemId.ts
import { ShoppingItem, ShoppingItemWithId } from "@/schemas/mealPlanResponse";

/**
 * Генерирует детерминированный ID для товара на основе его свойств.
 * Одинаковые товары получат одинаковый ID даже при разных генерациях.
 */
export function generateShoppingItemId(
  item: ShoppingItem,
  tripIndex: number,
): string {
  // Нормализуем строки: lowercase + trim
  const normalized = [
    item.category,
    item.name.toLowerCase().trim(),
    item.amount.toLowerCase().trim(),
    String(tripIndex),
  ].join("|");

  // Простой хэш для краткости ID
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return `item-${Math.abs(hash).toString(36)}`;
}

/**
 * Добавляет стабильные ID ко всем товарам в списке покупок.
 * Вызывается при получении ответа от Claude перед сохранением.
 */
export function addIdsToShoppingItems(
  trips: ShoppingTrip[],
): ShoppingTripWithIds[] {
  return trips.map((trip, tripIndex) => ({
    ...trip,
    items: trip.items.map((item) => ({
      ...item,
      id: generateShoppingItemId(item, tripIndex),
    })),
  }));
}
```

**Использование:**

```typescript
// В API route после получения ответа от Claude
const result = await generateObject({ ... });
const planWithIds = {
    ...result.object,
    shoppingTrips: addIdsToShoppingItems(result.object.shoppingTrips),
};
return Response.json(planWithIds);
```

**Почему это важно:**

- При перегенерации "Яйца — 6 шт" получит тот же ID
- Состояние чекбоксов в KV (`meal-planner:checked:2026-02`) сохранится
- Если пользователь отметил товар и перегенерировал план — отметка останется (если товар остался)

### API Routes

**Индексирование планов:**

Вместо `kv.keys('meal-planner:plan:*')` (который сканирует все ключи) используем отдельный индекс — список ключей планов в отсортированном множестве (sorted set).

**Структура в KV:**

```
meal-planner:plan-index         → sorted set: { "2026-02": 202602, "2026-01": 202601, ... }
meal-planner:plan:2026-02       → { weekPlan, shoppingTrips, ... }
meal-planner:checked:2026-02    → ["item-1", "item-2", ...]
```

```typescript
// app/api/plans/route.ts — список планов + сохранение нового
import { kv } from "@vercel/kv";
import { MealPlanResponseSchema } from "@/schemas/mealPlanResponse";
import { PersistedPlanSchema } from "@/schemas/persistedPlan";
import { getCurrentWeekInfo, getPlanKey } from "@/utils/weekNumber";

// GET /api/plans — список всех планов (для пагинации)
export async function GET() {
  // Получаем список ключей из индекса (sorted set, от новых к старым)
  const planKeys = await kv.zrange<string[]>("meal-planner:plan-index", 0, -1, {
    rev: true,
  });

  if (!planKeys || planKeys.length === 0) {
    return Response.json({ plans: [], total: 0 });
  }

  // Загружаем метаданные всех планов
  const plans = await Promise.all(
    planKeys.map(async (key) => {
      const plan = await kv.get(`meal-planner:plan:${key}`);
      const parsed = PersistedPlanSchema.safeParse(plan);
      if (!parsed.success) return null;

      return {
        weekKey: key,
        weekNumber: parsed.data.weekNumber,
        year: parsed.data.year,
        weekStart: parsed.data.weekStart,
        weekEnd: parsed.data.weekEnd,
        savedAt: parsed.data.savedAt,
      };
    }),
  );

  const validPlans = plans.filter(Boolean);
  return Response.json({ plans: validPlans, total: validPlans.length });
}

// POST /api/plans — сохранить новый план
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = MealPlanResponseSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Invalid data" }, { status: 400 });
  }

  const weekInfo = getCurrentWeekInfo();
  const planKey = getPlanKey(weekInfo.year, weekInfo.weekNumber);
  // Score для сортировки: YYYYWW (например, 202602 для недели 2 года 2026)
  const score = weekInfo.year * 100 + weekInfo.weekNumber;

  const planWithMeta = {
    ...parsed.data,
    ...weekInfo,
    savedAt: new Date().toISOString(),
  };

  // Атомарно сохраняем план и добавляем в индекс
  await Promise.all([
    kv.set(`meal-planner:plan:${planKey}`, planWithMeta),
    kv.zadd("meal-planner:plan-index", { score, member: planKey }),
  ]);

  return Response.json({
    ok: true,
    weekNumber: weekInfo.weekNumber,
    year: weekInfo.year,
  });
}
```

```typescript
// app/api/plans/[weekKey]/route.ts — конкретный план
import { kv } from "@vercel/kv";
import { PersistedPlanSchema } from "@/schemas/persistedPlan";

// GET /api/plans/2026-02 — получить план по ключу
export async function GET(
  req: Request,
  { params }: { params: { weekKey: string } },
) {
  const plan = await kv.get(`meal-planner:plan:${params.weekKey}`);

  if (!plan) {
    return Response.json({ error: "Plan not found" }, { status: 404 });
  }

  const parsed = PersistedPlanSchema.safeParse(plan);

  if (!parsed.success) {
    return Response.json({ error: "Invalid plan data" }, { status: 500 });
  }

  return Response.json(parsed.data);
}
```

### Клиентский хук

```typescript
// hooks/usePlans.ts
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PersistedPlan, PlansList } from "@/schemas/persistedPlan";
import { MealPlanResponse } from "@/schemas/mealPlanResponse";
import { getPlanKey } from "@/utils/weekNumber";

export function usePlans() {
  const router = useRouter();
  const [plansList, setPlansList] = useState<PlansList | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PersistedPlan | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка списка планов при старте
  useEffect(() => {
    fetch("/api/plans")
      .then((res) => res.json())
      .then((data: PlansList) => {
        setPlansList(data);
        // Загружаем первый (самый новый) план
        if (data.plans.length > 0) {
          const first = data.plans[0];
          loadPlan(first.year, first.weekNumber);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Загрузка конкретного плана
  const loadPlan = useCallback(async (year: number, weekNumber: number) => {
    const key = getPlanKey(year, weekNumber);
    const res = await fetch(`/api/plans/${key}`);
    if (res.ok) {
      const plan = await res.json();
      setCurrentPlan(plan);
    }
  }, []);

  // Навигация между планами
  const goToPrevious = useCallback(() => {
    if (!plansList || currentIndex >= plansList.plans.length - 1) return;
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    const plan = plansList.plans[newIndex];
    loadPlan(plan.year, plan.weekNumber);
  }, [plansList, currentIndex, loadPlan]);

  const goToNext = useCallback(() => {
    if (!plansList || currentIndex <= 0) return;
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    const plan = plansList.plans[newIndex];
    loadPlan(plan.year, plan.weekNumber);
  }, [plansList, currentIndex, loadPlan]);

  // Сохранение нового плана (вызывается из /new)
  const savePlan = useCallback(
    async (plan: MealPlanResponse) => {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan),
      });
      const data = await res.json();
      if (data.ok) {
        // Редирект на главную
        router.push("/");
      }
      return data.ok;
    },
    [router],
  );

  return {
    plansList,
    currentPlan,
    currentIndex,
    isLoading,
    hasPlans: plansList ? plansList.total > 0 : false,
    hasPrevious: plansList ? currentIndex < plansList.plans.length - 1 : false,
    hasNext: currentIndex > 0,
    goToPrevious,
    goToNext,
    savePlan,
  };
}
```

---

## План реализации MVP

### 1. ✅ Инициализация проекта

- Создать Next.js + TypeScript проект
- Настроить Tailwind CSS
- Настроить next-intl (конфиг + `messages/ru.json`)
- Установить date-fns для работы с датами/неделями
- Создать Vercel KV store в dashboard и подключить к проекту

### 2. ✅ Zod-схемы и конфиг

- `schemas/appState.ts` — Zod-схемы для формы создания (календарь, кухни, условия)
- `schemas/mealPlanResponse.ts` — Zod-схема ответа Claude
- `schemas/persistedPlan.ts` — Zod-схемы для сохранённых планов (с weekNumber)
- `config/defaults.ts` — хардкод: люди, кухни, ограничения
- `utils/weekNumber.ts` — утилиты для работы с номером недели

### 3. Главная страница (/) — просмотр планов

- `MealPlanView` — таблица плана (read-only)
- `ShoppingListView` — список покупок с чекбоксами
- `TabSwitcher` — переключение План / Список
- `WeekPagination` — навигация между неделями (◀ Неделя N ▶)
- `EmptyState` — если нет планов
- `StickyPanel` — кнопка "Новый план" внизу
- `usePlans` хук — загрузка/навигация по планам

### 4. Страница создания (/new) — форма генерации

- `WeekCalendar` — сетка 7 дней × 3 приёма × 2 человека
- `MealSlotCell` — клик = смена статуса (🍽️ → ☕ → ❌)
- `CuisineSelector` — мультиселект кухонь
- `SpecialConditions` — textarea для особых условий
- Кнопка "← Назад" для возврата на главную

### 5. Двухэтапная генерация (план → список покупок)

**ВАЖНО:** Генерация разделена на два этапа для экономии API и лучшего UX.

**Этап 1: Генерация плана питания**
- `promptBuilder.ts` — собирает промпт из календаря + условий + хардкода
- **Исключение повторов:** перед генерацией получаем последний план из KV
- API route `/api/generate-meal-plan` — возвращает только `weekPlan` (без `shoppingTrips`)
- Можно перегенерировать план сколько угодно раз

**Этап 2: Генерация списка покупок**
- API route `/api/generate-shopping-list` — принимает подтверждённый план, возвращает `shoppingTrips`
- Вызывается только после подтверждения плана пользователем

**Хук и компоненты:**
- `useMealPlanGeneration` хук — состояние двухэтапной генерации (stage: idle → generating-plan → plan-ready → generating-shopping → complete)
- `GenerateSection` компонент:
  - **Этап 1:** Кнопка "Сгенерировать план" + превью плана + "Перегенерировать" + "Подтвердить план"
  - **Этап 2:** Превью списка покупок + "Вернуться к плану" + "Сохранить"
  - Loading / Error состояния для каждого этапа
  - **Выборочная перегенерация блюд** — можно пометить конкретные блюда для перегенерации (на этапе 1)
  - После "Сохранить" → редирект на `/`

### 6. Персистентность (Vercel KV)

**Что сохраняем:**

- **Планы по неделям** — каждый план с номером недели и годом

**API routes:**

- `GET /api/plans` — список всех планов (метаданные для пагинации)
- `POST /api/plans` — сохранить новый план (автоматически определяет текущую неделю)
- `GET /api/plans/[weekKey]` — получить конкретный план по ключу (2026-02)

**Структура данных в KV:**

```
meal-planner:plan:2026-02  → { weekPlan, shoppingTrips, weekNumber, year, weekStart, weekEnd, savedAt }
meal-planner:plan:2026-01  → { ... }
```

**UI flow:**

1. **Главная (`/`):**
   - Загружаем список планов
   - Показываем последний план или empty state
   - Пагинация между неделями

2. **Создание (`/new`):**
   - Заполняем форму (календарь, кухни, условия)
   - Генерируем план
   - Сохраняем → редирект на `/`

---

## Тестирование (Vitest)

### Установка

```bash
npm i -D vitest
```

### Что тестируем

| Файл                          | Что покрываем                                         |
| ----------------------------- | ----------------------------------------------------- |
| `schemas/mealPlanResponse.ts` | Парсинг валидного/невалидного JSON от Claude          |
| `schemas/persistedPlan.ts`    | Парсинг данных из KV                                  |
| `utils/weekNumber.ts`         | `getCurrentWeekInfo`, `formatWeekRange`, `getPlanKey` |
| `utils/promptBuilder.ts`      | Генерация промпта из разных состояний календаря       |
| `utils/shoppingItemId.ts`     | Стабильность и детерминированность ID товаров         |
| `lib/rateLimit.ts`            | Корректность подсчёта и сброса лимитов                |

### Примеры тестов

```typescript
// schemas/mealPlanResponse.test.ts
import { describe, test, expect } from "vitest";
import { parseMealPlanResponse } from "./mealPlanResponse";

describe("parseMealPlanResponse", () => {
  test("парсит валидный ответ Claude", () => {
    const valid = {
      weekPlan: [
        {
          day: "mon",
          breakfast: null,
          lunch: null,
          dinner: { name: "Паста", time: 30, portions: 2 },
        },
      ],
      shoppingTrips: [
        {
          label: "Поход 1",
          items: [{ name: "Паста", amount: "500 г", category: "pantry" }],
        },
      ],
    };
    expect(parseMealPlanResponse(valid)).not.toBeNull();
  });

  test("возвращает null для невалидного ответа", () => {
    expect(parseMealPlanResponse({ foo: "bar" })).toBeNull();
    expect(parseMealPlanResponse(null)).toBeNull();
    expect(parseMealPlanResponse("string")).toBeNull();
  });

  test("возвращает null если отсутствует обязательное поле", () => {
    const missingShoppingTrips = { weekPlan: [] };
    expect(parseMealPlanResponse(missingShoppingTrips)).toBeNull();
  });
});
```

```typescript
// utils/weekNumber.test.ts
import { describe, test, expect } from "vitest";
import { getPlanKey, formatWeekRange } from "./weekNumber";

describe("getPlanKey", () => {
  test("форматирует номер недели с ведущим нулём", () => {
    expect(getPlanKey(2026, 2)).toBe("2026-02");
    expect(getPlanKey(2026, 12)).toBe("2026-12");
  });
});

describe("formatWeekRange", () => {
  test("форматирует диапазон в одном месяце", () => {
    const result = formatWeekRange("2026-01-06", "2026-01-12");
    expect(result).toBe("6-12 янв");
  });

  test("форматирует диапазон на стыке месяцев", () => {
    const result = formatWeekRange("2025-12-29", "2026-01-04");
    expect(result).toMatch(/дек|янв/); // зависит от локали
  });
});
```

```typescript
// utils/promptBuilder.test.ts
import { describe, test, expect } from "vitest";
import { generatePrompt } from "./promptBuilder";

describe("generatePrompt", () => {
  const baseState = {
    schedules: {
      vitalik: {
        mon: { breakfast: "full", lunch: "skip", dinner: "full" },
      },
      lena: {
        mon: { breakfast: "coffee", lunch: "skip", dinner: "full" },
      },
    },
    selectedCuisines: ["asian", "italian"],
    specialConditions: "",
  };

  test("включает выбранные кухни в промпт", () => {
    const prompt = generatePrompt(baseState, null);
    expect(prompt).toContain("asian");
    expect(prompt).toContain("italian");
  });

  test("добавляет блюда из предыдущего плана в исключения", () => {
    const previousPlan = {
      weekPlan: [
        {
          day: "mon",
          breakfast: null,
          lunch: null,
          dinner: { name: "Карбонара", time: 30, portions: 2 },
        },
      ],
      shoppingTrips: [],
    };
    const prompt = generatePrompt(baseState, previousPlan);
    expect(prompt).toContain("Карбонара");
    expect(prompt).toMatch(/не использ|исключ/i);
  });
});
```

```typescript
// utils/shoppingItemId.test.ts
import { describe, test, expect } from "vitest";
import {
  generateShoppingItemId,
  addIdsToShoppingItems,
} from "./shoppingItemId";

describe("generateShoppingItemId", () => {
  test("генерирует одинаковый ID для одинаковых товаров", () => {
    const item = { name: "Яйца", amount: "6 шт", category: "dairy" as const };
    const id1 = generateShoppingItemId(item, 0);
    const id2 = generateShoppingItemId(item, 0);
    expect(id1).toBe(id2);
  });

  test("генерирует разные ID для разных товаров", () => {
    const item1 = { name: "Яйца", amount: "6 шт", category: "dairy" as const };
    const item2 = { name: "Молоко", amount: "1 л", category: "dairy" as const };
    expect(generateShoppingItemId(item1, 0)).not.toBe(
      generateShoppingItemId(item2, 0),
    );
  });

  test("ID стабилен при разном регистре", () => {
    const item1 = { name: "Яйца", amount: "6 шт", category: "dairy" as const };
    const item2 = { name: "яйца", amount: "6 ШТ", category: "dairy" as const };
    expect(generateShoppingItemId(item1, 0)).toBe(
      generateShoppingItemId(item2, 0),
    );
  });

  test("разные tripIndex дают разные ID", () => {
    const item = { name: "Яйца", amount: "6 шт", category: "dairy" as const };
    expect(generateShoppingItemId(item, 0)).not.toBe(
      generateShoppingItemId(item, 1),
    );
  });
});

describe("addIdsToShoppingItems", () => {
  test("добавляет ID ко всем товарам", () => {
    const trips = [
      {
        label: "Поход 1",
        items: [
          { name: "Яйца", amount: "6 шт", category: "dairy" as const },
          { name: "Молоко", amount: "1 л", category: "dairy" as const },
        ],
      },
    ];

    const result = addIdsToShoppingItems(trips);

    expect(result[0].items[0]).toHaveProperty("id");
    expect(result[0].items[1]).toHaveProperty("id");
    expect(result[0].items[0].id).not.toBe(result[0].items[1].id);
  });
});
```

### Конфигурация

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

### Скрипты в package.json

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

---

## Верификация

**Тесты главной страницы (/):**

1. При наличии планов — показывается последний план
2. При отсутствии планов — показывается empty state
3. Табы "План" / "Список покупок" переключаются корректно
4. Пагинация работает: ◀ ▶ переключают между неделями
5. Номер недели и даты отображаются правильно
6. Чекбоксы в списке покупок работают
7. Кнопка "Новый план" ведёт на `/new`

**Тесты страницы создания (/new):**

1. Клик по ячейке меняет статус циклически (🍽️ → ☕ → ❌ → 🍽️)
2. Выбор кухонь работает (чекбоксы включаются/выключаются)
3. Textarea для особых условий сохраняет текст
4. Кнопка "← Назад" возвращает на главную
5. Кнопка "Скопировать промпт" копирует в буфер обмена

**Тесты двухэтапной AI-интеграции:**

*Этап 1 — Генерация плана питания:*
1. Кнопка "Сгенерировать план" отправляет запрос на `/api/generate-meal-plan`
2. Во время загрузки показывается спиннер и текст "Генерируем план питания..."
3. При ошибке API показывается сообщение об ошибке
4. Успешный ответ парсится через `MealPlanOnlyResponseSchema` (без shoppingTrips)
5. План соответствует заданному расписанию (null для пропущенных слотов)
6. **Исключение повторов:** блюда из последнего плана добавляются в промпт как исключения
7. Кнопки "Перегенерировать" и "Подтвердить план" появляются после генерации

*Этап 2 — Генерация списка покупок:*
8. Кнопка "Подтвердить план" отправляет запрос на `/api/generate-shopping-list`
9. В запрос передаётся подтверждённый план питания
10. Показывается спиннер и текст "Генерируем список покупок..."
11. Успешный ответ парсится через `ShoppingListResponseSchema`
12. Кнопки "Вернуться к плану" и "Сохранить" появляются после генерации списка

**Тесты выборочной перегенерации (Этап 1):**

1. Клик по блюду в превью помечает его для перегенерации (появляется иконка ⟳)
2. Повторный клик снимает пометку
3. Счётчик "Исправить (N)" показывает количество помеченных блюд
4. Кнопка "Исправить" неактивна если ничего не выбрано
5. "Исправить" вызывает `/api/regenerate-meals` с правильными параметрами
6. После частичной перегенерации обновляются только выбранные блюда
7. Остальные блюда в плане не изменяются

**Тесты персистентности (Vercel KV):**

1. После "Сохранить" план сохраняется с номером недели и годом
2. Сохраняется полный план (weekPlan + shoppingTrips)
3. Происходит редирект на `/` после сохранения
4. Новый план появляется в списке на главной
5. План для той же недели перезаписывается (не дублируется)
6. Пагинация корректно загружает разные планы

**E2E проверка (двухэтапный flow):**

1. Открыть `/` → видим empty state
2. Нажать "Создать план" → переход на `/new`
3. Настроить расписание, выбрать кухни, добавить условия
4. Нажать "Сгенерировать план" → дождаться результата (только план, без списка покупок)
5. (Опционально) Нажать "Перегенерировать" несколько раз пока план не понравится
6. Нажать "Подтвердить план" → генерируется список покупок
7. (Опционально) Нажать "Вернуться к плану" → можно перегенерировать план
8. Нажать "Сохранить" → редирект на `/`
9. Видим сохранённый план с правильным номером недели
10. Переключиться на таб "Список покупок" → видим сгруппированный список

---

## Выборочная перегенерация блюд (Этап 1)

На **Этапе 1** (после генерации плана питания, но перед подтверждением) пользователь может пометить отдельные блюда, которые не понравились, и перегенерировать только их.

**ВАЖНО:** Выборочная перегенерация доступна только на Этапе 1, до подтверждения плана. После нажатия "Подтвердить план" генерируется список покупок (Этап 2), и для изменения блюд нужно вернуться к Этапу 1 через кнопку "Вернуться к плану".

### UI превью плана с выборочной перегенерацией (Этап 1)

```
┌──────────────────────────────────────────────────────────────────────┐
│  ЭТАП 1: План питания                                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  │      │ Завтрак              │ Обед    │ Ужин                   │  │
│  │ Пн   │ Тост с авокадо (10м) │    —    │ [⟳] Курица терияки (35м)│  │
│  │ Вт   │ —                    │    —    │ Тако с говядиной (40м)  │  │
│  │ Ср   │ [⟳] Омлет (15м)      │    —    │ Паста карбонара (25м)   │  │
│  │ Чт   │ —                    │    —    │ [⟳] Рис с овощами (30м) │  │
│  │ ...  │ ...                  │   ...   │ ...                     │  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ Выбрано для перегенерации: 3 блюда                             │  │
│  │ • Курица терияки (Пн, ужин)                                    │  │
│  │ • Омлет (Ср, завтрак)                                          │  │
│  │ • Рис с овощами (Чт, ужин)                                     │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  [ 🔄 Перегенерировать ]  [ ✏️ Исправить (3) ]  [ ✅ Подтвердить ]  │
│                                                                      │
│  (После "Подтвердить" → генерируется список покупок)                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Взаимодействие (Этап 1)

| Действие                | Результат                                                     |
| ----------------------- | ------------------------------------------------------------- |
| **Клик по блюду**       | Toggle пометки "перегенерировать" (добавляется иконка ⟳)      |
| **"Исправить (N)"**     | Перегенерирует только помеченные блюда, остальные сохраняются |
| **"Перегенерировать"**  | Генерирует весь план заново                                   |
| **"Подтвердить план"**  | Переход к Этапу 2 → генерация списка покупок                  |

### Состояние компонента

```typescript
// hooks/useMealPlanGeneration.ts (расширение)
interface MealPlanGenerationState {
  result: MealPlanResponse | null;
  isLoading: boolean;
  error: string | null;
  // Новое: блюда для перегенерации
  mealsToRegenerate: Set<string>; // формат: "mon-dinner", "wed-breakfast"
}

// Переключение пометки блюда
const toggleMealForRegeneration = (day: Day, meal: Meal) => {
  const key = `${day}-${meal}`;
  setMealsToRegenerate((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  });
};

// Частичная перегенерация
const regenerateSelected = async () => {
  // Вызываем API с указанием каких блюд нужно перегенерировать
  // и передаём текущий план как базу
};
```

### API для частичной перегенерации

```typescript
// app/api/regenerate-meals/route.ts
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { MealPlanResponseSchema } from "@/schemas/mealPlanResponse";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      state, // AppState — текущие настройки календаря
      currentPlan, // MealPlanResponse — текущий сгенерированный план
      mealsToRegenerate, // string[] — ["mon-dinner", "wed-breakfast"]
    } = body;

    const prompt = generatePartialRegenerationPrompt(
      state,
      currentPlan,
      mealsToRegenerate,
    );

    // Claude возвращает полный план с обновлёнными блюдами и пересчитанным списком покупок
    const result = await generateObject({
      model: anthropic("claude-sonnet-4-20250514"),
      schema: MealPlanResponseSchema,
      prompt,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error("Regeneration failed:", error);

    if (error instanceof Error) {
      if (error.message?.includes("rate_limit")) {
        return Response.json(
          { error: "Слишком много запросов. Подождите минуту." },
          { status: 429 },
        );
      }
      if (error.message?.includes("content_filter")) {
        return Response.json(
          { error: "Запрос отклонён фильтром контента." },
          { status: 400 },
        );
      }
    }

    return Response.json(
      { error: "Ошибка перегенерации плана" },
      { status: 500 },
    );
  }
}
```

### Промпт для частичной перегенерации

**Важно:** Промпт включает полный контекст текущего плана, чтобы:

- Избежать дублирования ингредиентов с существующими блюдами
- Сохранить стилистическую согласованность недели
- Корректно пересчитать список покупок

```typescript
// utils/promptBuilder.ts (добавить функцию)
function generatePartialRegenerationPrompt(
  state: AppState,
  currentPlan: MealPlanResponse,
  mealsToRegenerate: string[],
): string {
  // Извлекаем названия блюд, которые нужно заменить
  const mealsToExclude = mealsToRegenerate
    .map((key) => {
      const [day, meal] = key.split("-") as [Day, Meal];
      const dayPlan = currentPlan.weekPlan.find((d) => d.day === day);
      return dayPlan?.[meal]?.name;
    })
    .filter(Boolean);

  // Форматируем существующий план (блюда, которые остаются)
  const existingMeals = currentPlan.weekPlan
    .flatMap((day) => {
      const meals: string[] = [];
      const dayKey = day.day;
      if (day.breakfast && !mealsToRegenerate.includes(`${dayKey}-breakfast`)) {
        meals.push(`${DAY_LABELS[dayKey]} завтрак: ${day.breakfast.name}`);
      }
      if (day.lunch && !mealsToRegenerate.includes(`${dayKey}-lunch`)) {
        meals.push(`${DAY_LABELS[dayKey]} обед: ${day.lunch.name}`);
      }
      if (day.dinner && !mealsToRegenerate.includes(`${dayKey}-dinner`)) {
        meals.push(`${DAY_LABELS[dayKey]} ужин: ${day.dinner.name}`);
      }
      return meals;
    })
    .join("\n");

  return `
# РОЛЬ
Ты — планировщик питания. Нужно предложить ЗАМЕНУ для некоторых блюд в существующем плане.

# СУЩЕСТВУЮЩИЙ ПЛАН (НЕ МЕНЯТЬ)
${existingMeals}

# БЛЮДА ДЛЯ ЗАМЕНЫ
${mealsToRegenerate
  .map((key) => {
    const [day, meal] = key.split("-");
    return `- ${DAY_LABELS[day]}, ${MEAL_LABELS[meal]}`;
  })
  .join("\n")}

# НЕ ПРЕДЛАГАТЬ
Эти блюда уже были в этих слотах — предложи другие:
${mealsToExclude.map((m) => `- ${m}`).join("\n")}

# ВАЖНЫЕ ПРАВИЛА
- Не дублируй ингредиенты с существующими блюдами (см. "СУЩЕСТВУЮЩИЙ ПЛАН")
- Сохраняй общий стиль недели (если много азиатских блюд — предлагай азиатские)
- Пересчитай список покупок с учётом ВСЕХ блюд (старых + новых)

# ОГРАНИЧЕНИЯ
${formatRestrictions(state)}

# ФОРМАТ ВЫВОДА
Верни полный план с обновлёнными блюдами и пересчитанным списком покупок:
{
  "weekPlan": [...],  // полный план на неделю
  "shoppingTrips": [...] // полный пересчитанный список покупок
}
`;
}
```

### Переводы

```json
// messages/ru.json (добавить)
{
  "generation": {
    "generatePlan": "Сгенерировать план",
    "regeneratePlan": "Перегенерировать план",
    "confirmPlan": "Подтвердить план",
    "generatingPlan": "Генерируем план питания...",
    "generatingShopping": "Генерируем список покупок...",
    "backToPlan": "Вернуться к плану",
    "planReady": "План готов! Подтвердите для генерации списка покупок.",
    "shoppingReady": "Список покупок готов!",
    "save": "Сохранить",
    "selectedForRegeneration": "Выбрано для перегенерации: {count} блюд",
    "fixSelected": "Исправить ({count})",
    "clickToMark": "Клик по блюду = пометить для перегенерации"
  }
}
```

### Визуальный стиль помеченных блюд

```tsx
// components/MealPreviewCell.tsx
function MealPreviewCell({ meal, isMarkedForRegeneration, onToggle }: Props) {
  return (
    <td
      onClick={onToggle}
      className={`
                border p-3 cursor-pointer transition-all
                ${
                  isMarkedForRegeneration
                    ? "bg-amber-900/30 border-amber-500 ring-2 ring-amber-500/50"
                    : "hover:bg-gray-700/50"
                }
            `}
    >
      <div className="flex items-center gap-2">
        {isMarkedForRegeneration && <span className="text-amber-400">⟳</span>}
        <div>
          <div
            className={`font-medium ${isMarkedForRegeneration ? "text-amber-200" : ""}`}
          >
            {meal.name}
          </div>
          <div className="text-sm text-gray-500">{meal.time} мин</div>
        </div>
      </div>
    </td>
  );
}
```

---

## Будущие улучшения (после MVP)

- Второй язык (English) + переключатель в UI
- Удаление старых планов
