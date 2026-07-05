import pg from 'pg';
import 'dotenv/config';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  console.log('Подключение успешно!');
  await client.end();
} catch (err) {
  console.error('Ошибка подключения:', err.message);
}