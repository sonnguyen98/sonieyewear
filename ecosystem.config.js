module.exports = {
  apps: [{
    name: 'soni-kinh',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: 'D:/website - Quán Kính/soni-kinh',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
