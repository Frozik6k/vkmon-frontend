import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { storageApi } from '../api/client';
import { StorageNodeDto, StorageType } from '../api/types';

const storageLabels: Record<StorageType, string> = {
  IMAGES: 'Изображения',
  VIDEOS: 'Видео',
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
  const [nodes, setNodes] = useState<StorageNodeDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPathByStorage, setCurrentPathByStorage] = useState<Record<StorageType, string>>({
    IMAGES: '',
    VIDEOS: '',
  });
  const filesInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const currentPath = currentPathByStorage[storage];
  const getParentPath = (path: string) => {
    const trimmed = path.endsWith('/') ? path.slice(0, -1) : path;
    const lastSlashIndex = trimmed.lastIndexOf('/');
    if (lastSlashIndex === -1) return '';
    return `${trimmed.slice(0, lastSlashIndex + 1)}`;
  };
  const visibleNodes = useMemo(() => nodes, [nodes]);
  const getNodeName = useCallback((node: StorageNodeDto) => {
    if (node.name) return node.name;
    const trimmed = node.path.endsWith('/') ? node.path.slice(0, -1) : node.path;
    const segments = trimmed.split('/').filter(Boolean);
    return segments[segments.length - 1] ?? node.path;
  }, []);
  const breadcrumbs = useMemo(() => {
    const base = [
      { label: 'Медиа контент', path: '' },
      { label: storageLabels[storage], path: '' },
    ];
    if (!currentPath) return base;
    const segments = currentPath.split('/').filter(Boolean);
    let accumulated = '';
    const folderCrumbs = segments.map((segment) => {
      accumulated = `${accumulated}${segment}/`;
      return { label: segment, path: accumulated };
    });
    return [...base, ...folderCrumbs];
  }, [currentPath, storage]);
  const totals = useMemo(() => {
    const folders = nodes.filter((item) => item.type === 'FOLDER').length;
    const files = nodes.filter((item) => item.type === 'FILE').length;
    const size = nodes.reduce((acc, item) => acc + (item.size ?? 0), 0);
    return { folders, files, size };
  }, [nodes]);
  const parentPath = useMemo(() => getParentPath(currentPath), [currentPath]);

  const loadNodes = useCallback(
    async (activeStorage: StorageType, path: string) => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await storageApi.listNodes(activeStorage, path || undefined);
        setNodes(response.nodes ?? []);
      } catch (error) {
        console.error('Unable to load storage nodes', error);
        setErrorMessage('Не удалось загрузить список файлов. Проверьте подключение к API.');
        setNodes([]);
      } finally {
        setIsLoading(false);
      }
    },
    [setNodes]
  );

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('directory', '');
    }
  }, []);

  useEffect(() => {
    void loadNodes(storage, currentPath);
  }, [storage, currentPath, loadNodes]);

  const handleCreateFolder = async () => {
    const name = window.prompt('Введите название папки');
    if (!name) return;
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const normalizedPath = `${currentPath}${trimmedName.replace(/\s+/g, '-').toLowerCase()}/`;
    try {
      await storageApi.createFolder(storage, { path: normalizedPath });
      await loadNodes(storage, currentPath);
    } catch (error) {
      console.error('Unable to create folder', error);
      setErrorMessage('Не удалось создать папку. Проверьте подключение к API.');
    }
  };

  const handleFilesSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const relativePaths = files
      .map((file) => file.webkitRelativePath)
      .filter((path): path is string => Boolean(path));
    try {
      await storageApi.upload(
        storage,
        { basePath: currentPath },
        files,
        relativePaths.length ? relativePaths : undefined
      );
      await loadNodes(storage, currentPath);
    } catch (error) {
      console.error('Unable to upload files', error);
      setErrorMessage('Не удалось загрузить файлы. Проверьте подключение к API.');
    }
    event.target.value = '';
  };

  const openFilesDialog = () => {
    filesInputRef.current?.click();
  };
  
  const handleOpenFolder = (path: string) => {
    setCurrentPathByStorage((prev) => ({
      ...prev,
      [storage]: path,
    }));
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
        <span className="tag">API: /storage/{'{storage}'}/nodes · /storage/{'{storage}'}/folder · /storage/{'{storage}'}/upload</span>
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
            <div className="breadcrumb-row">
              <div className="breadcrumb">
                {breadcrumbs.map((crumb, index) => (
                  <span key={`${crumb.label}-${crumb.path}`} className="breadcrumb-item">
                    <button
                      className="breadcrumb-button"
                      type="button"
                      onClick={() => handleOpenFolder(crumb.path)}
                    >
                      {crumb.label}
                    </button>
                    {index < breadcrumbs.length - 1 && <span className="breadcrumb-separator">/</span>}
                  </span>
                ))}
              </div>
              <div className="breadcrumb-actions">
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => handleOpenFolder(parentPath)}
                  disabled={!currentPath}
                >
                  На уровень выше
                </button>
              </div>
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
		{errorMessage && <div className="alert alert-error">{errorMessage}</div>}
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
            {isLoading && (
              <tr>
                <td colSpan={5}>Загрузка...</td>
              </tr>
            )}
            {!isLoading &&
              visibleNodes.map((node) => (
                <tr key={node.path}>
                  <td>
                    <div className="node-name">
                      <span className={`node-icon ${node.type === 'FOLDER' ? 'folder' : 'file'}`} />
                      <div>
                        {node.type === 'FOLDER' ? (
                          <button
                            type="button"
                            className="node-link"
                            onClick={() => handleOpenFolder(node.path)}
                          >
                            {getNodeName(node)}
                          </button>
                        ) : (
                          <strong>{getNodeName(node)}</strong>
                        )}
                        <div className="muted-text">{node.path}</div>
                      </div>
                  </td>
                  <td>{node.type === 'FOLDER' ? 'Папка' : node.contentType ?? '—'}</td>
                  <td>
                    {node.type === 'FOLDER'
                      ? node.itemsCount != null
                        ? `${node.itemsCount} элементов`
                        : '—'
                      : formatSize(node.size)}
                  </td>
                  <td>{node.lastModified ? new Date(node.lastModified).toLocaleString('ru-RU') : '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-ghost"
                        type="button"
                        onClick={node.type === 'FOLDER' ? () => handleOpenFolder(node.path) : undefined}
                        disabled={node.type !== 'FOLDER'}
                      >
                        Открыть
                      </button>
                      <button className="btn btn-ghost" type="button">
                        Скачать
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {!isLoading && !visibleNodes.length && (
              <tr>
                <td colSpan={5}>Нет файлов для отображения.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}