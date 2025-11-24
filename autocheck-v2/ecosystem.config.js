module.exports = {
  apps: [
    {
      name: 'autocheck-api',
      cwd: './apps/api',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M'
    },
    {
      name: 'autocheck-frontend',
      cwd: './apps/frontend',
      script: 'npm',
      args: 'run dev -- --host 0.0.0.0 --port 5173',
      env: {
        NODE_ENV: 'development'
      },
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M'
    }
  ]
};
