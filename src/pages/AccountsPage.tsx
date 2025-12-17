import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '../api/client';
import type { VkAccount } from '../api/types';

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: accountsApi.list });
  const [selectedId, setSelectedId] = useState<number | null>(accounts[0]?.id ?? null);
  const { data: groups = [] } = useQuery({
    queryKey: ['groups', selectedId],
    queryFn: () => accountsApi.groups(selectedId ?? 0),
    enabled: Boolean(selectedId),
  });

  useEffect(() => {
    if (!selectedId && accounts.length > 0) {
      setSelectedId(accounts[0].id);
    }
  }, [accounts, selectedId]);

  const mutation = useMutation({
    mutationFn: (payload: Pick<VkAccount, 'alias' | 'token'>) => accountsApi.create(payload),
    onSuccess: (newAccount) => {
      queryClient.setQueryData<VkAccount[]>(['accounts'], (old = []) => [...old, newAccount]);
      setSelectedId(newAccount.id);
    },
  });

  const selectedAccount = useMemo(() => accounts.find((acc) => acc.id === selectedId), [accounts, selectedId]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const alias = String(formData.get('alias'));
    const token = String(formData.get('token'));
    mutation.mutate({ alias, token });
    event.currentTarget.reset();
  };

  return (
    <div>
      <div className="page-header">
        <h2>VK аккаунты</h2>
        <div className="tag">/vk-accounts + /vk-accounts/{'{id}'}/groups</div>
      </div>

      <div className="grid-two">
        <div className="card">
          <h3>Список</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Alias</th>
                <th>Статус</th>
                <th>Группы</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{account.alias}</div>
                    <div style={{ color: '#475569', fontSize: 12 }}>{account.username}</div>
                  </td>
                  <td>
                    <span className={`status-pill status-${account.status.toLowerCase()}`}>
                      {account.status}
                    </span>
                  </td>
                  <td>{account.groupsCount}</td>
                  <td>
                    <button className="btn btn-ghost" onClick={() => setSelectedId(account.id)}>
                      Подробнее
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Добавить аккаунт</h3>
          <p style={{ marginTop: 0, color: '#475569' }}>CreateVkAccountRequest: alias + token</p>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Название (alias)
              <input className="input" name="alias" placeholder="Рабочий аккаунт" required />
            </label>
            <label>
              Токен VK
              <input className="input" name="token" placeholder="vk1.a...." required />
            </label>
            <button className="btn btn-primary" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Создаем…' : 'Создать'}
            </button>
          </form>
        </div>
      </div>

      {selectedAccount && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="page-header" style={{ marginBottom: 12 }}>
            <h3>Группы аккаунта {selectedAccount.alias}</h3>
            <span className="badge">AgeLimits + статус</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Группа</th>
                <th>Возраст</th>
                <th>Активность</th>
                <th>Последний пост</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.vkGroupId}>
                  <td>{group.name}</td>
                  <td>{group.ageLimits}</td>
                  <td>{group.isEnabled ? 'Включена' : 'Отключена'}</td>
                  <td>{group.lastPostAt ? new Date(group.lastPostAt).toLocaleString('ru-RU') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
