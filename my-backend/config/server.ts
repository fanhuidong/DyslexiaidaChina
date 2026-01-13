export default ({ env }) => ({
  host: env('127.0.0.1', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
