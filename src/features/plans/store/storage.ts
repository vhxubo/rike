import localforage from 'localforage'
import type { StateStorage } from 'zustand/middleware'

const database = localforage.createInstance({
  name: 'rike',
  storeName: 'plan_state',
  description: 'Rike local study plan data',
})

let writesBlocked = false

export function setPlanStorageWritesBlocked(blocked: boolean) {
  writesBlocked = blocked
}

export const planStateStorage: StateStorage = {
  async getItem(name) {
    return (await database.getItem<string>(name)) ?? null
  },
  async setItem(name, value) {
    if (writesBlocked) return
    await database.setItem(name, value)
  },
  async removeItem(name) {
    if (writesBlocked) return
    await database.removeItem(name)
  },
}
