import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '../api/client';
import type { VkAccount } from '../api/types';

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: accountsApi.list });
  const [selectedId, setSelectedId] = useState<number | null>(accounts[0]?.id ?? null);
  const { data: groups = [], refetch: refetchGroups } = useQuery({
    queryKey: ['groups', selectedId],
    queryFn: () => accountsApi.groups(selectedId ?? 0),
    enabled: selectedId !== null,
  });
  const {
    data: availableGroups = [],
    isFetching: isFetchingAvailableGroups,
	refetch: refetchAvailableGroups,
  } = useQuery({
    queryKey: ['available-groups', selectedId],
    queryFn: () => accountsApi.availableGroups(selectedId ?? 0),
    enabled: selectedId !== null,
  });
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [isEditingGroups, setIsEditingGroups] = useState(false);

  const ageLimitLabels: Record<string, string> = {
    NONE: 'Без ограничений',
    SIXTEEN: '16+',
    EIGHTEEN: '18+',
    '1': 'Без ограничений',
    '2': '16+',
    '3': '18+',
  };

  const formatAgeLimit = (ageLimit: string | number | null | undefined) => {
    if (ageLimit === null || ageLimit === undefined || ageLimit === '') {
      return '—';
    }
    const normalized = typeof ageLimit === 'string' ? ageLimit : String(ageLimit);
    const match = normalized.match(/value=(\d+)/);
    const normalizedKey = match?.[1] ?? normalized;
    return ageLimitLabels[normalizedKey] ?? normalized;
  };


  useEffect(() => {
    if (!selectedId && accounts.length > 0) {
      setSelectedId(accounts[0].id);
    }
  }, [accounts, selectedId]);
  
  useEffect(() => {
    if (!selectedId) {
      setSelectedGroupIds([]);
      return;
    }
    setSelectedGroupIds(groups.map((group) => group.vkGroupId));
  }, [groups, selectedId]);

  useEffect(() => {
    setIsEditingGroups(false);
  }, [selectedId]);


  const mutation = useMutation({
    mutationFn: (payload: Pick<VkAccount, 'alias' | 'token'>) => accountsApi.create(payload),
    onSuccess: (newAccount) => {
      queryClient.setQueryData<VkAccount[]>(['accounts'], (old = []) => [...old, newAccount]);
      setSelectedId(newAccount.id);
    },
  });
  
  const removeAccountMutation = useMutation({
    mutationFn: (accountId: number) => accountsApi.remove(accountId),
    onSuccess: (_, accountId) => {
      queryClient.setQueryData<VkAccount[]>(['accounts'], (old = []) =>
        old.filter((account) => account.id !== accountId),
      );
      queryClient.removeQueries({ queryKey: ['groups', accountId] });
      queryClient.removeQueries({ queryKey: ['available-groups', accountId] });
      if (selectedId === accountId) {
        const remaining = accounts.filter((account) => account.id !== accountId);
        setSelectedId(remaining[0]?.id ?? null);
      }
    },
  });
  
  const syncGroupsMutation = useMutation({
    mutationFn: (payload: { accountId: number; groupIds: number[] }) =>
      accountsApi.syncGroups(payload.accountId, payload.groupIds),
    onSuccess: (_, payload) => {
      queryClient.setQueryData(['groups', payload.accountId], () =>
        availableGroups.filter((group) => payload.groupIds.includes(group.vkGroupId)),
      );
      setIsEditingGroups(false);
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

  const handleGroupToggle = (groupId: number) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId],
    );
  };

  const handleSyncGroups = () => {
    if (!selectedId) {
      return;
    }
    syncGroupsMutation.mutate({ accountId: selectedId, groupIds: selectedGroupIds });
  };

  const handleStartEditingGroups = async () => {
    if (!selectedId) {
      return;
    }
    setIsEditingGroups(true);
    await Promise.all([refetchGroups(), refetchAvailableGroups()]);
  };

  const handleRemoveAccount = (account: VkAccount) => {
    const confirmed = window.confirm(`Удалить аккаунт "${account.alias}"?`);
    if (!confirmed) {
      return;
    }
    removeAccountMutation.mutate(account.id);
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
                <th></th>
                <th>Alias</th>
                <th>Статус</th>
                <th>Группы</th>
                <th></th>
				<th></th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr
                  key={account.id}
                  className={selectedId === account.id ? 'table-row-selected' : undefined}
                  onClick={() => setSelectedId(account.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <input
                      type="radio"
                      name="selected-account"
                      checked={selectedId === account.id}
                      onChange={() => setSelectedId(account.id)}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </td>
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
                    <button
                      className="btn btn-ghost"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedId(account.id);
                      }}
                    >
                      Подробнее
                    </button>
                  </td>
				  <td>
                    <button
                      className="btn btn-danger"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveAccount(account);
                      }}
                      disabled={removeAccountMutation.isPending}
                    >
                      Удалить
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
        <>
          <div className="card" style={{ marginTop: 16 }}>
            <div className="page-header" style={{ marginBottom: 12 }}>
              <div>
                <h3>Группы аккаунта {selectedAccount.alias}</h3>
                <p style={{ margin: 0, color: '#475569' }}>
                  {isEditingGroups
                    ? 'Отметьте группы для добавления/удаления в аккаунте.'
                    : 'Добавленные группы для выбранного аккаунта.'}
                </p>
              </div>
              {isEditingGroups ? (
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleSyncGroups}
                  disabled={syncGroupsMutation.isPending || isFetchingAvailableGroups}
                >
                  {syncGroupsMutation.isPending ? 'Сохраняем…' : 'Сохранить'}
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleStartEditingGroups}
                  disabled={isFetchingAvailableGroups}
                >
                  {isFetchingAvailableGroups ? 'Обновляем…' : 'Обновить'}
                </button>
              )}
            </div>
            <table className="table">
              <thead>
                <tr>
                  {isEditingGroups && <th></th>}
                  <th>Группа</th>
                  <th>Возраст</th>
                  <th>Активность</th>
                  <th>Последний пост</th>
                </tr>
              </thead>
              <tbody>
                {(isEditingGroups ? availableGroups : groups).map((group) => (
                  <tr key={group.vkGroupId}>
                    {isEditingGroups && (
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedGroupIds.includes(group.vkGroupId)}
                          onChange={() => handleGroupToggle(group.vkGroupId)}
                        />
                      </td>
                    )}
                    <td>{group.name}</td>
                    <td>{formatAgeLimit(group.ageLimits)}</td>
                    <td>{group.isEnabled ? 'Включена' : 'Отключена'}</td>
                    <td>{group.lastPostAt ? new Date(group.lastPostAt).toLocaleString('ru-RU') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
