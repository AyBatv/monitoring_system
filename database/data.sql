INSERT INTO roles (id, name, description) VALUES
(1, 'Администратор', 'Полный доступ к системе, управление пользователями и инфраструктурой'),
(2, 'Инженер', 'Мониторинг серверов, регистрация и устранение аварийных инцидентов'),
(3, 'Руководитель', 'Контроль соблюдения SLA, аналитика надежности и отчеты');

INSERT INTO users (id, full_name, email, telegram_chat_id, is_active, role_id) VALUES
(1, 'Administrator', 'admin@example.com', '123456789', 1, 1),
(2, 'Иванов П.С.', 'ivanov@corp.ru', '987654321', 1, 2),
(3, 'Петрова М.А.', 'petrova@corp.ru', NULL, 1, 2),
(4, 'Сидоров К.В.', 'sidorov@corp.ru', NULL, 1, 3);

INSERT INTO servers (id, hostname, ip_address, os_version, status) VALUES
(1, 'web-server-01', '192.168.1.10', 'Ubuntu 22.04 LTS', 'Online'),
(2, 'db-server-01', '192.168.1.20', 'CentOS 8', 'Online'),
(3, 'mail-server-01', '192.168.1.30', 'Windows Server 2019', 'Maintenance'),
(4, 'backup-01', '192.168.1.40', 'Debian 12', 'Online');

INSERT INTO metrics (id, metric_name, warning_threshold, critical_threshold, check_interval_sec, server_id) VALUES
(1, 'CPU', 80.00, 95.00, 30, 1),
(2, 'RAM', 75.00, 90.00, 30, 1),
(3, 'Disk', 85.00, 95.00, 60, 2),
(4, 'ICMP_Ping', 100.00, 500.00, 10, 2);

INSERT INTO metric_values (id, timestamp, value, status_code, metric_id) VALUES
(1, '2026-11-05 10:00:00', 45.20, 200, 1),
(2, '2026-11-05 10:00:30', 62.80, 200, 1),
(3, '2026-11-05 10:00:00', 55.00, 200, 2),
(4, '2026-11-05 10:00:00', 96.40, 200, 3);

INSERT INTO incidents (id, severity, status, started_at, resolved_at, downtime_minutes, server_id, user_id) VALUES
(1, 'CRITICAL', 'In Progress', '2026-11-05 09:30:00', NULL, NULL, 2, 2),
(2, 'WARNING', 'Resolved', '2026-11-04 18:00:00', '2026-11-04 18:45:00', 45, 3, 1);

SELECT setval(pg_get_serial_sequence('roles', 'id'), COALESCE(MAX(id), 1)) FROM roles;
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id), 1)) FROM users;
SELECT setval(pg_get_serial_sequence('servers', 'id'), COALESCE(MAX(id), 1)) FROM servers;
SELECT setval(pg_get_serial_sequence('metrics', 'id'), COALESCE(MAX(id), 1)) FROM metrics;
SELECT setval(pg_get_serial_sequence('metric_values', 'id'), COALESCE(MAX(id), 1)) FROM metric_values;
SELECT setval(pg_get_serial_sequence('incidents', 'id'), COALESCE(MAX(id), 1)) FROM incidents;
