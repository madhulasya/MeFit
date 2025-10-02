import env from 'dotenv';

const configEnv = () => {
  // On Vercel, use dashboard environment variables; do not override
  if (process.env.VERCEL) return;

  const path = process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';

  // Force local .env to override existing vars
  env.config({ path, override: true });
};

export { configEnv }