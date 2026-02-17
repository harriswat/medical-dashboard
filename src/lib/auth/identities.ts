export const IDENTITIES = {
  harris: {
    email: 'harriswatk@gmail.com',
    password: 'harris-care-2026',
    displayName: 'Harris',
    role: 'patient' as const,
  },
  kent: {
    email: 'kentwatkins1@me.com',
    password: 'kent-care-2026',
    displayName: 'Kent',
    role: 'caregiver' as const,
  },
} as const

export type IdentityKey = keyof typeof IDENTITIES

export const IDENTITY_STORAGE_KEY = 'medical-dashboard-identity'

export function isValidIdentityKey(key: unknown): key is IdentityKey {
  return typeof key === 'string' && key in IDENTITIES
}
