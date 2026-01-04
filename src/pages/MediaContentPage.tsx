import { useEffect, useMemo, useRef, useState } from 'react';

type StorageType = 'IMAGES' | 'VIDEOS';

type NodeType = 'FOLDER' | 'FILE';

interface StorageNode {
  type: NodeType;
  name: string;
  path: string;
  itemsCount?: number;
  size?: number;
  contentType?: string;
  lastModified?: string;
}

const mockNodes: Record<StorageType, StorageNode[]> = {
  IMAGES: [
    {
      type: 'FOLDER',
      name: 'Промо-баннеры',
      path: 'promo/',
      itemsCount: 12,
      lastModified: '2024-09-03T10:12:00Z',
    },
    {
      type: 'FOLDER',
      name: 'Обложки',
      path: 'covers/',
      itemsCount: 5,
      lastModified: '2024-09-02T14:40:00Z',
    },
    {
      type: 'FILE',
      name: 'summer-campaign.png',
      path: 'promo/summer-campaign.png',
      size: 824_000,
      contentType: 'image/png',
      lastModified: '2024-09-03T11:25:00Z',
    },
    {
      type: 'FILE',
      name: 'new-avatar.jpg',
      path: 'covers/new-avatar.jpg',
      size: 492_000,
      contentType: 'image/jpeg',
      lastModified: '2024-09-01T08:10:00Z',
    },
  ],
  VIDEOS: [
    {
      type: 'FOLDER',
      name: 'Рекламные ролики',
      path: 'ads/',
      itemsCount: 4,
      lastModified: '2024-09-04T15:30:00Z',
    },
    {
      type: 'FILE',
      name: 'launch-teaser.mp4',
      path: 'ads/launch-teaser.mp4',
      size: 98_400_000,
      contentType: 'video/mp4',
      lastModified: '2024-09-04T09:05:00Z',
    },
    {
      type: 'FILE',
      name: 'product-demo.mov',
      path: 'demo/product-demo.mov',
      size: 188_200_000,
      contentType: 'video/quicktime',
      lastModified: '2024-09-02T17:45:00Z',
    },
  ],
};

const breadcrumbs: Record<StorageType, string[]> = {
  IMAGES: ['Медиа контент', 'Изображения'],
  VIDEOS: ['Медиа контент', 'Видео'],
};

const storageDescriptions: Record<StorageType, string> = {
  IMAGES: 'Хранилище изображений в S3 (префикс /images).',
  VIDEOS: 'Хранилище видео в S3 (префикс /videos).',
};

const formatSize = (size?: number) => {
  if (!size) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let index = 0;
  let value = size;
  while (value > 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
};

export default function MediaContentPage() {
  const [storage, setStorage] = useState<StorageType>('IMAGES');
  const [storageNodes, setStorageNodes] = useState<Record<StorageType, StorageNode[]>>(mockNodes);
  const filesInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const nodes = useMemo(() => storageNodes[storage], [storage, storageNodes]);
  const totals = useMemo(() => {
    const folders = nodes.filter((item) => item.type === 'FOLDER').length;
    const files = nodes.filter((item) => item.type === 'FILE').length;
    const size = nodes.reduce((acc, item) => acc + (item.size ?? 0), 0);
    return { folders, files, size };
  }, [nodes]);

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('directory', '');
    }
  }, []);

  const appendNodes = (newNodes: StorageNode[]) => {
    setStorageNodes((prev) => ({
      ...prev,
      [storage]: [...newNodes, ...prev[storage]],
    }));
  };

  const handleCreateFolder = () => {
    const name = window.prompt('Введите название папки');
    if (!name) return;
    const trimmedName = name.trim();
    if (!trimmedName) return;
    appendNodes([
      {
        type: 'FOLDER',
        name: trimmedName,
        path: `${trimmedName.replace(/\s+/g, '-').toLowerCase()}/`,
        itemsCount: 0,
        lastModified: new Date().toISOString(),
      },
    ]);
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    appendNodes(
      files.map((file) => ({
        type: 'FILE',
        name: file.name,
        path: file.webkitRelativePath || file.name,
        size: file.size,
        contentType: file.type || 'application/octet-stream',
        lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : undefined,
      }))
    );
    event.target.value = '';
  };

  const openFilesDialog = () => {
    filesInputRef.current?.click();
  };

  const openFolderDialog = () => {
    folderInputRef.current?.click();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Медиа контент</h2>
          <p className="page-subtitle">
            Управление файлами и папками в S3: раздельные хранилища для изображений и видео.
          </p>
        </div>
        <span className="tag">API: /storage/nodes · /storage/folders · /storage/uploads</span>
      </div>

      <div className="storage-toggle">
        {(['IMAGES', 'VIDEOS'] as StorageType[]).map((item) => (
          <button
            key={item}
            type="button"
            className={`storage-tab${storage === item ? ' active' : ''}`}
            onClick={() => setStorage(item)}
          >
            {item === 'IMAGES' ? 'Хранилище изображений' : 'Хранилище видео'}
          </button>
        ))}
      </div>

      <div className="media-grid">
        <section className="card">
          <div className="section">
            <div className="breadcrumb">
              {breadcrumbs[storage].map((crumb, index) => (
                <span key={crumb} className="breadcrumb-item">
                  {crumb}
                  {index < breadcrumbs[storage].length - 1 && <span className="breadcrumb-separator">/</span>}
                </span>
              ))}
            </div>
            <p className="muted-text">{storageDescriptions[storage]}</p>
          </div>

          <div className="toolbar">
            <button className="btn btn-primary" type="button" onClick={handleCreateFolder}>
              Создать папку
            </button>
            <button className="btn btn-ghost" type="button" onClick={openFilesDialog}>
              Загрузить файлы
            </button>
            <button className="btn btn-ghost" type="button" onClick={openFolderDialog}>
              Загрузить папку
            </button>
          </div>

          <div className="upload-panel">
            <div>
              <h3>Загрузка контента</h3>
              <p className="muted-text">
                Поддерживается загрузка отдельных файлов или целых папок. При выборе папки можно сохранить структуру.
              </p>
            </div>
            <div className="dropzone">
              <span>Перетащите файлы сюда или выберите на компьютере</span>
              <button className="btn btn-primary" type="button" onClick={openFilesDialog}>
                Выбрать файлы/папку
              </button>
            </div>
          </div>
		  <input
            ref={filesInputRef}
            className="visually-hidden"
            type="file"
            multiple
            onChange={handleFilesSelected}
          />
          <input
            ref={folderInputRef}
            className="visually-hidden"
            type="file"
            multiple
            onChange={handleFilesSelected}
          />
        </section>

        <section className="card">
          <h3>Сводка хранилища</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Папки</span>
              <strong>{totals.folders}</strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Файлы</span>
              <strong>{totals.files}</strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Общий размер</span>
              <strong>{formatSize(totals.size)}</strong>
            </div>
          </div>
          <div className="section">
            <h4>Политика конфликтов</h4>
            <ul className="muted-list">
              <li>RENAME — автопереименование при конфликте имени.</li>
              <li>REPLACE — перезапись существующего файла.</li>
              <li>SKIP — пропуск при совпадении ключа.</li>
            </ul>
          </div>
          <div className="section">
            <h4>Структура данных</h4>
            <p className="muted-text">
              Узлы возвращаются как StorageNodeDto: тип FILE/FOLDER, путь, размер, контент-тайп и метаданные.
            </p>
          </div>
        </section>
      </div>

      <section className="card">
        <h3>Список файлов и папок</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Тип</th>
              <th>Размер / элементы</th>
              <th>Обновлено</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node) => (
              <tr key={node.path}>
                <td>
                  <div className="node-name">
                    <span className={`node-icon ${node.type === 'FOLDER' ? 'folder' : 'file'}`} />
                    <div>
                      <strong>{node.name}</strong>
                      <div className="muted-text">{node.path}</div>
                    </div>
                  </div>
                </td>
                <td>{node.type === 'FOLDER' ? 'Папка' : node.contentType}</td>
                <td>{node.type === 'FOLDER' ? `${node.itemsCount ?? 0} элементов` : formatSize(node.size)}</td>
                <td>{node.lastModified ? new Date(node.lastModified).toLocaleString('ru-RU') : '—'}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-ghost" type="button">
                      Открыть
                    </button>
                    <button className="btn btn-ghost" type="button">
                      Скачать
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}