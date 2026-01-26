# Настройка Firebase для InstructCompare

Рейтинг на странице «Оценка» сохраняется в **Firestore**. Если Firebase не настроен, используется только localStorage (результаты только в вашем браузере).

## 1. Создание проекта

1. Откройте [Firebase Console](https://console.firebase.google.com/).
2. **Создать проект** (или выберите существующий).
3. Включите **Firestore Database**: в меню слева → **Создать базу данных** → **Начать в тестовом режиме** (для разработки). Регион — любой.

## 2. Регистрация приложения

1. В настройках проекта (шестерёнка) → **Общие** → **Ваши приложения**.
2. Нажмите **</>** (веб), введите имя приложения, при необходимости отметьте Firebase Hosting.
3. Скопируйте объект `firebaseConfig` (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).

## 3. Подстановка конфига

### HTML-версия

Откройте `js/firebase-config.js` и замените значения в `FIREBASE_CONFIG` на свои:

```js
var FIREBASE_CONFIG = {
  apiKey: "ваш_api_key",
  authDomain: "ваш-проект.firebaseapp.com",
  projectId: "ваш-проект-id",
  storageBucket: "ваш-проект.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc..."
};
```

### React-версия (app/)

Откройте `app/src/firebase-config.js` и замените поля в `firebaseConfig` на свои.

## 4. Правила Firestore

В консоли Firebase: **Firestore** → **Правила** — вставьте содержимое файла `firestore.rules` из корня проекта:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /stats/{document=**} { allow read, write: if true; }
    match /votes/{userId} { allow read, write: if true; }
  }
}
```

Либо загрузите правила через Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

(предварительно: `firebase init` и указать `firestore.rules` в конфиге).

> Для продакшена ограничьте доступ (по `request.auth` или своему backend).

## 5. Структура данных в Firestore

- **`stats/rating`** — документ с полями `sum` (сумма оценок) и `count` (количество). Создаётся при первом голосе.
- **`votes/{clientId}`** — один документ на браузер, поле `value` (1–5). Один голос на `clientId`, повторное нажатие обновляет оценку.

## 6. Установка зависимостей (только React)

В папке `app/`:

```bash
npm install
```

После настройки рейтинг будет общим для всех пользователей.
