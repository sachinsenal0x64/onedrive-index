import Redis from 'ioredis'
import siteConfig from '../../config/site.config'

// Persistent key-value store is provided by Redis, hosted on Upstash
// https://vercel.com/integrations/upstash
const kv = new Redis(process.env.REDIS_URL || '')

export async function getOdAuthTokens(): Promise<{ accessToken: unknown; refreshToken: unknown }> {
  const accessToken = await kv.get(`${siteConfig.kvPrefix}access_token`)
  const refreshToken = await kv.get(`${siteConfig.kvPrefix}refresh_token`)

  return {
    accessToken,
    refreshToken,
  }
}

export async function storeOdAuthTokens({
  accessToken,
  accessTokenExpiry,
  refreshToken,
}: {
  accessToken: string
  accessTokenExpiry: number
  refreshToken: string
}): Promise<void> {
  await kv.set(`${siteConfig.kvPrefix}access_token`, accessToken, 'EX', accessTokenExpiry)
  await kv.set(`${siteConfig.kvPrefix}refresh_token`, refreshToken)
}

export async function getCache({ key }: { key: string }): Promise<{ data: unknown, exists: number }> {
  const data = await kv.get(`${siteConfig.kvPrefix}_cache:${key}`);
  const exists = await kv.exists(`${siteConfig.kvPrefix}_cache:${key}`);
  return { data, exists }
}

export async function setCache({ key, value, ex = 300 }: { key: string, value: string, ex?: number }): Promise<void> {
  await kv.set(`${siteConfig.kvPrefix}_cache:${key}`, value, 'EX', ex);
}