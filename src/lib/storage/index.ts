export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
}

export type StorageErrorCode = 'read-failed' | 'write-failed' | 'remove-failed'

export class StorageError extends Error {
  constructor(
    public readonly code: StorageErrorCode,
    options?: ErrorOptions,
  ) {
    super(code, options)
    this.name = 'StorageError'
  }
}

