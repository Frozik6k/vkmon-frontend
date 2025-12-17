import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '../api/client';
import { AiGenerateRequest } from '../api/types';

export default function AiPage() {
  const [form, setForm] = useState<AiGenerateRequest>({
    prompt: 'Сгенерируй пост про автопостинг VKmon',
    promptImage: 'Креатив с интерфейсом VK',
    maxLength: 120,
    tone: 'дружелюбный',
    language: 'ru',
    includeHashtags: true,
  });

  const mutation = useMutation({
    mutationFn: (payload: AiGenerateRequest) => aiApi.generate(payload),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div>
      <div className="page-header">
        <h2>AI генерация контента</h2>
        <span className="tag">/ai/post</span>
      </div>

      <div className="grid-two">
        <form className="card form-grid" onSubmit={handleSubmit}>
          <label>
            Описание поста
            <textarea
              className="input"
              rows={4}
              value={form.prompt}
              onChange={(e) => setForm({ ...form, prompt: e.target.value })}
            />
          </label>
          <label>
            Описание картинки
            <input
              className="input"
              value={form.promptImage ?? ''}
              onChange={(e) => setForm({ ...form, promptImage: e.target.value })}
            />
          </label>
          <label>
            Максимальная длина
            <input
              className="input"
              type="number"
              value={form.maxLength}
              onChange={(e) => setForm({ ...form, maxLength: Number(e.target.value) })}
            />
          </label>
          <label>
            Тон
            <input className="input" value={form.tone ?? ''} onChange={(e) => setForm({ ...form, tone: e.target.value })} />
          </label>
          <label>
            Язык
            <input
              className="input"
              value={form.language ?? ''}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={form.includeHashtags}
              onChange={(e) => setForm({ ...form, includeHashtags: e.target.checked })}
            />
            Добавлять хэштеги
          </label>
          <button className="btn btn-primary" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Генерируем…' : 'Сгенерировать'}
          </button>
        </form>

        <div className="card">
          <h3>Черновик поста</h3>
          {mutation.data ? (
            <div>
              <p style={{ whiteSpace: 'pre-line' }}>{mutation.data.post}</p>
              {mutation.data.imageUrl && (
                <img src={mutation.data.imageUrl} style={{ width: '100%', borderRadius: 12, marginTop: 8 }} alt="AI" />
              )}
            </div>
          ) : (
            <p style={{ color: '#475569' }}>Отправьте форму, чтобы получить текст и картинку от AI.</p>
          )}
        </div>
      </div>
    </div>
  );
}
