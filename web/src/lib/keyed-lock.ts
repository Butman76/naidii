// Замок в памяти процесса по ключу: параллельные вызовы с одним ключом
// выполняются по очереди (нужно там, где "прочитать, изменить, записать"
// без атомарной операции в базе — например, счётчик просмотров профиля).
// Процесс Next.js на VPS один (naidii-web.service), поэтому замока в
// памяти достаточно.
const queues = new Map<string, Promise<unknown>>();

export async function withKeyedLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const previous = queues.get(key) ?? Promise.resolve();
  const run = previous.catch(() => {}).then(fn);
  queues.set(key, run);
  try {
    return await run;
  } finally {
    if (queues.get(key) === run) queues.delete(key);
  }
}
