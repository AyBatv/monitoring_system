# Server Monitoring System

Веб-ориентированная информационная система мониторинга состояния и доступности серверной инфраструктуры.

---

## 📁 Структура проекта (`project/`)

```text
project/
├── backend/                  # Серверная часть (REST API на FastAPI)
│   ├── app/
│   │   ├── __init__.py       # Маркер пакета Python
│   │   ├── main.py           # Инициализация FastAPI, CORS и статическая раздача Frontend
│   │   ├── database.py       # Подключение к СУБД PostgreSQL (SQLAlchemy SessionLocal)
│   │   ├── models.py         # Декларативные ORM-модели (Server, Metric, Incident, User, Role)
│   │   ├── schemas.py        # Pydantic-схемы валидации и сериализации (DTO)
│   │   ├── crud.py           # Бизнес-логика выполнения CRUD-операций
│   │   └── routers/          # Контроллеры маршрутов API
│   │       ├── servers.py    # Маршруты управления серверами (/api/servers/)
│   │       ├── metrics.py    # Маршруты телеметрии (/api/metrics/)
│   │       ├── incidents.py  # Маршруты инцидентов (/api/incidents/)
│   │       └── users.py      # Маршруты пользователей (/api/users/)
│   ├── requirements.txt      # Список зависимостей Python (FastAPI, SQLAlchemy, psycopg2)
│   └── .env.example          # Шаблон переменных окружения (подключение к PostgreSQL)
│
├── database/                 # Скрипты инициализации реляционной БД PostgreSQL
│   ├── schema.sql            # DDL-скрипт создания таблиц со связями и внешними ключами
│   └── data.sql              # DML-скрипт наполнения таблиц контрольными тестовыми данными
│
├── frontend/                 # Пользовательский интерфейс (SPA на светлом фоне)
│   ├── index.html            # Семантическая разметка SPA (авторизация, дашборд, реестр серверов, модалки)
│   ├── style.css             # Минималистичные стили, строгая адаптивная верстка, таблицы, бейджи
│   └── app.js                # Клиентская логика, Fetch API, валидация полей, управление состоянием
│
├── .gitignore                # Исключение временных файлов, кэша и конфиденциальных данных
├── test_system.py            # Набор автоматизированных тестов интеграции компонентов
└── README.md                 # Документация проекта
```

---

## 🚀 Инструкция по запуску

### 1. Подготовка базы данных (PostgreSQL)
Убедитесь, что служба PostgreSQL запущена, и создана база данных `server_monitoring_db`:
```sql
CREATE DATABASE server_monitoring_db;
```
Примените DDL и DML скрипты из папки `database/`:
```bash
psql -U postgres -d server_monitoring_db -f database/schema.sql
psql -U postgres -d server_monitoring_db -f database/data.sql
```

---

### 2. Запуск серверной части (FastAPI)
Перейдите в директорию `backend` и выполните команду:
```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

После старта доступны следующие адреса:
* **Пользовательский интерфейс (Frontend):** [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
* **Интерактивная документация Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **Документация ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### 3. Запуск автоматизированного тестирования
Для проверки интеграции всех компонентов и работы API запустите:
```bash
python test_system.py
```

---

## 🔑 Данные для входа в систему

* **Email:** `admin@example.com`
* **Пароль:** `admin123`
* **Роль:** Администратор
