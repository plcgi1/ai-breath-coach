module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    // First application
    {
      name: 'ether-ai-server',
      script: 'dist/src/main.js',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      node_args: '--harmony',
      env: {
        NODE_ENV: 'development',
        PORT: 3030,
        NODE_VERSION: '24',
      },
      env_dev: {
        NODE_ENV: 'development',
        PORT: 3030,
        NODE_VERSION: '24',
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3030,
        NODE_VERSION: '24',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3030,
        NODE_VERSION: '24',
      },
    },
    // https://codeaccuracy.blogspot.com/2020/08/cron-jobs-in-pm2.html
  ],
}
