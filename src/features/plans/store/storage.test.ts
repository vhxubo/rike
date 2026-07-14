import {
  planStateStorage,
  setPlanStorageWritesBlocked,
} from '@/features/plans/store/storage'

describe('plan state storage', () => {
  const key = 'rike-storage-test'

  afterEach(async () => {
    setPlanStorageWritesBlocked(false)
    await planStateStorage.removeItem(key)
  })

  it('writes, reads, and removes serialized state with localForage', async () => {
    const value = JSON.stringify({ state: { selectedDate: '2026-07-14' }, version: 1 })

    await planStateStorage.setItem(key, value)
    await expect(planStateStorage.getItem(key)).resolves.toBe(value)

    await planStateStorage.removeItem(key)
    await expect(planStateStorage.getItem(key)).resolves.toBeNull()
  })

  it('does not overwrite storage while recovery is blocked', async () => {
    await planStateStorage.setItem(key, 'original')
    setPlanStorageWritesBlocked(true)

    await planStateStorage.setItem(key, 'replacement')

    await expect(planStateStorage.getItem(key)).resolves.toBe('original')
  })
})
