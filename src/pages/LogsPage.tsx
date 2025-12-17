import { useQuery } from '@tanstack/react-query';
import { logsApi } from '../api/client';
import { plans } from '../api/mockData';

export default function LogsPage() {
  const { data: logs = [] } = useQuery({ queryKey: ['logs'], queryFn: logsApi.list });

  return (
    <div>
      <div className="page-header">
        <h2>Логи и биллинг</h2>
        <span className="tag">/logs · /billing</span>
      </div>

      <div className="grid-two">
        <div className="card">
          <h3>Журнал операций</h3>
          <div className="log-list">
            {logs.map((log: any) => (
              <div key={log.id} className="log-item">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className={`status-pill status-${String(log.level).toLowerCase()}`}>
                    {log.level}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>
                    {log.createdAt ? new Date(log.createdAt).toLocaleString('ru-RU') : '—'}
                  </span>
                </div>
                <div style={{ fontWeight: 600 }}>{log.message}</div>
                <div style={{ color: '#475569' }}>{log.source ?? 'backend'}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Тарифы</h3>
          <p style={{ marginTop: 0, color: '#475569' }}>Привязаны к UUID планов в dto Register.</p>
          <div className="grid-two">
            {plans.map((plan) => (
              <div key={plan.id} className="card" style={{ boxShadow: 'none', borderColor: '#e2e8f0' }}>
                <div className="page-header" style={{ marginBottom: 8 }}>
                  <strong>{plan.name}</strong>
                  <span className="badge">{plan.price}</span>
                </div>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
