import { defineConfig } from 'vite'; // ← это обязательно
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // делаем сервер доступным на всех интерфейсах
    port: 5173, // устанавливаем порт
    strictPort: true, // если порт занят, сервер не запустится
    cors: true, // разрешаем CORS
    headers: {
      'Access-Control-Allow-Origin': '*', // разрешаем все источники
    },
    open: '/bonus', // автоматически открывается /bonus при старте
  }
});
