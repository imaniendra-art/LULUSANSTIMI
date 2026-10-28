module.exports = {
  apps: [
    {
      name: 'lulusanstimi',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3022',
      cwd: 'D:\\LULUSANSTIMI',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3022,
        DATABASE_URL: 'mongodb://lulusanstimi:makassar123@ac-agfy6q0-shard-00-00.v7atwug.mongodb.net:27017,ac-agfy6q0-shard-00-01.v7atwug.mongodb.net:27017,ac-agfy6q0-shard-00-02.v7atwug.mongodb.net:27017/lulusanstimi?ssl=true&replicaSet=atlas-41s83f-shard-0&authSource=admin',
        STORAGE_DIR: 'storage/uploads',
        PANDAWA_WEBHOOK_SECRET: 'stimi_secret_key_2026_xyz',
        NEXT_PUBLIC_APP_URL: 'https://lulusan.stimiapps.my.id'
      }
    },
    {
      name: 'cloudflared-lulusan',
      script: 'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe',
      args: 'tunnel --config "C:\\Users\\Iman Prasetyo Amir\\.cloudflared\\config-lulusan.yml" run lulusanstimi',
      instances: 1,
      autorestart: true,
      watch: false
    }
  ]
};
