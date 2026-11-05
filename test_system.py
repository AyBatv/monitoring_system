import os
import sys

sys.path.insert(0, os.path.abspath('backend'))

from app.main import app
from starlette.testclient import TestClient

client = TestClient(app)

tests = []

print("=" * 70)
print("  ЗАПУСК АВТОМАТИЗИРОВАННОГО ТЕСТИРОВАНИЯ ИС МОНИТОРИНГА СЕРВЕРОВ")
print("=" * 70)

r = client.get('/')
tests.append(('TC-01', 'Проверка доступности SPA-клиента (GET /)', r.status_code == 200))

r = client.get('/docs')
tests.append(('TC-02', 'Проверка интерактивной документации Swagger UI (GET /docs)', r.status_code == 200))

r = client.get('/api/servers/')
tests.append(('TC-03', 'Чтение списка серверов (GET /api/servers/)', r.status_code == 200 and isinstance(r.json(), list)))

payload = {'hostname': 'test-server-qa', 'ip_address': '10.0.0.99', 'os_version': 'Debian 12', 'status': 'Online'}
r = client.post('/api/servers/', json=payload)
created_id = r.json().get('id') if r.status_code == 201 else None
tests.append(('TC-04', 'Создание сервера через API (POST 201 Created)', r.status_code == 201 and created_id is not None))

if created_id:
    r = client.put(f'/api/servers/{created_id}', json={'hostname': 'test-server-qa', 'ip_address': '10.0.0.99', 'os_version': 'Debian 12', 'status': 'Maintenance'})
    tests.append(('TC-05', 'Обновление параметров сервера (PUT 200 OK)', r.status_code == 200 and r.json().get('status') == 'Maintenance'))

if created_id:
    r = client.delete(f'/api/servers/{created_id}')
    tests.append(('TC-06', 'Удаление тестового сервера (DELETE 200 OK)', r.status_code == 200))

r = client.get('/api/servers/999999')
tests.append(('TC-07', 'Обработка запроса несуществующего ресурса (HTTP 404)', r.status_code == 404 and 'detail' in r.json()))

r = client.post('/api/servers/', json={'hostname': 'no-ip-server'})
tests.append(('TC-08', 'Валидация обязательных полей модели Pydantic (HTTP 422)', r.status_code == 422))

print("\n--- РЕЗУЛЬТАТЫ ВЫПОЛНЕНИЯ ТЕСТОВЫХ СЦЕНАРИЕВ ---")
passed = 0
for tid, name, res in tests:
    st = "PASSED [УСПЕШНО]" if res else "FAILED [ОШИБКА]"
    if res:
        passed += 1
    print(f"[{tid}] {name:<60} -> {st}")

pct = (passed / len(tests)) * 100
print("-" * 70)
print(f"ИТОГ: Успешно пройдено {passed} из {len(tests)} тестов ({pct:.1f}%).")
print("=" * 70)
