import { Redis } from '@upstash/redis';

// For server-side usage
export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// For client-side PubSub (if needed via HTTP or custom hook, mostly handled by @upstash/realtime on client)
