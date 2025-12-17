import { useQuery } from '@tanstack/react-query';
import { accountsApi } from '../api/client';
import { mockGroups } from '../api/mockData';

export default function DashboardPage() {
  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: accountsApi.list });

  const totalGroups = mockGroups.length;
  const enabledGroups = mockGroups.filter((group) => group.isEnabled).length;

  return (
    <div>
      <div className="page-header">
        <h2>Обзор платформы</h2>
        <span className="tag">API: /login, /vk-accounts, /vk-groups</span>
      </div>

      <div className="card-grid">
        <div className="card">
          <h3>Подключенные аккаунты</h3>
          <p>
            {accounts.length} аккаунт(ов) VK активировано. Последняя синхронизация:{' '}
            {accounts[0]?.lastSyncAt ? new Date(accounts[0].lastSyncAt).toLocaleString('ru-RU') : '—'}
          </p>
        </div>
        <div className="card">
          <h3>Группы VK</h3>
          <p>
            {enabledGroups}/{totalGroups} групп в работе · фиксированных постов: {mockGroups.reduce((acc, g) => acc + (g.fixedPost ?? 0), 0)}
          </p>
        </div>
        <div className="card">
          <h3>Автопостинг</h3>
          <p>Шаблон расписания из ScheduleDto: CRON или SIMPLE с часовыми поясами.</p>
        </div>
        <div className="card">
          <h3>AI генерация</h3>
          <p>Эндпоинт /ai/post принимает prompt, promptImage и maxLength для подготовки черновиков.</p>
        </div>
      </div>
    </div>
  );
}
