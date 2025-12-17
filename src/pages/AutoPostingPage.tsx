import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { autopostApi } from '../api/client';
import { AutoPostRequest } from '../api/types';

const defaultSchedule: AutoPostRequest = {
  schedule: {
    cronExpression: '0 0 10 * * *',
    timezone: 'Europe/Moscow',
  },
  groupId: 1,
  isEnabled: true,
};

export default function AutoPostingPage() {
  const [payload, setPayload] = useState<AutoPostRequest>(defaultSchedule);
  const mutation = useMutation({
    mutationFn: (body: AutoPostRequest) => autopostApi.update(body),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate(payload);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Автопостинг</h2>
        <span className="tag">ScheduleDto + AutoPostController</span>
      </div>

      <div className="banner">
        Опираться на типы ScheduleDto / AutoPostRequest: cronExpression для CRON или intervalHours / daysOfWeek для SIMPLE
        расписания. Здесь можно быстро проверить бэкенд-эндпоинт автопостинга.
      </div>

      <form className="card form-grid" onSubmit={handleSubmit}>
        <label>
          CRON expression
          <input
            className="input"
            value={payload.schedule.cronExpression ?? ''}
            onChange={(e) => setPayload({ ...payload, schedule: { ...payload.schedule, cronExpression: e.target.value } })}
          />
        </label>
        <label>
          Часовой пояс
          <input
            className="input"
            value={payload.schedule.timezone ?? ''}
            onChange={(e) => setPayload({ ...payload, schedule: { ...payload.schedule, timezone: e.target.value } })}
          />
        </label>
        <label>
          Каждые N часов (для SIMPLE)
          <input
            className="input"
            type="number"
            value={payload.schedule.intervalHours ?? 0}
            onChange={(e) =>
              setPayload({ ...payload, schedule: { ...payload.schedule, intervalHours: Number(e.target.value) } })
            }
          />
        </label>
        <label>
          id группы VK
          <input
            className="input"
            type="number"
            value={payload.groupId ?? 0}
            onChange={(e) => setPayload({ ...payload, groupId: Number(e.target.value) })}
          />
        </label>
        <label>
          Включено
          <input
            type="checkbox"
            checked={payload.isEnabled}
            onChange={(e) => setPayload({ ...payload, isEnabled: e.target.checked })}
          />
        </label>

        <button className="btn btn-primary" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Отправляем...' : 'Сохранить настройки'}
        </button>
        {mutation.isSuccess && <div style={{ color: '#16a34a', fontWeight: 600 }}>Запрос отправлен</div>}
      </form>
    </div>
  );
}
