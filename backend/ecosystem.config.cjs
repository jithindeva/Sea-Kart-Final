module.exports = {
  apps: [
    {
      name: 'sea-kart-backend',
      script: './server.ts',
      interpreter: 'node',
      interpreter_args: '--import tsx',
      instances: 'max', // Scale to all available CPU cores for 100,000+ users
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
