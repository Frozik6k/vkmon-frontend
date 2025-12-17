import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/client';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', subscription: '' });

  const loginMutation = useMutation({
    mutationFn: () => authApi.login({ username: form.email, password: form.password }),
  });

  const registerMutation = useMutation({
    mutationFn: () => authApi.register({ email: form.email, password: form.password, id: form.subscription }),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLogin) {
      loginMutation.mutate();
    } else {
      registerMutation.mutate();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>{isLogin ? 'Авторизация' : 'Регистрация'}</h2>
        <div className="tag">/login · /register</div>
      </div>

      <div className="card">
        <div className="page-header" style={{ marginBottom: '12px' }}>
          <div>
            <strong>Работаем с DTO Login / Register</strong>
            <p style={{ margin: 0, color: '#475569' }}>
              username/email + пароль, опционально id тарифа для регистрации.
            </p>
          </div>
          <div>
            <button className="btn btn-ghost" onClick={() => setIsLogin((prev) => !prev)}>
              {isLogin ? 'Перейти к регистрации' : 'У меня уже есть аккаунт'}
            </button>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Почта / username
            <input
              className="input"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Пароль
            <input
              className="input"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          {!isLogin && (
            <label>
              План подписки (UUID)
              <input
                className="input"
                placeholder="например: 123e4567-e89b-12d3-a456-426614174000"
                value={form.subscription}
                onChange={(e) => setForm({ ...form, subscription: e.target.value })}
              />
            </label>
          )}
          <div>
            <button className="btn btn-primary" type="submit">
              {isLogin ? 'Войти' : 'Зарегистрироваться'}
            </button>
            {(loginMutation.isSuccess || registerMutation.isSuccess) && (
              <span style={{ marginLeft: 12, color: '#16a34a', fontWeight: 600 }}>Успешно отправлено</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
