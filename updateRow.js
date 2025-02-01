// api/updateRow.js
import { Redis } from '@upstash/redis';
import axios from 'axios';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

export default async function handler(req, res) {
  try {
    // Получаем rowId из тела запроса
    const { rowId } = req.body;

    // Генерируем уникальный номер
    const counterValue = await redis.incr('row_counter');

    // Обновляем строку в Glide
    const glideResponse = await axios.post(
      'https://api.glideapp.io/api/1/mutate/tables',
      {
        appID: 'FUK9hUsG7w9z8PtTLtwq',
        mutations: [
          {
            kind: 'set-columns-in-row',
            tableName: 'native-table-iQWpW4ewfWyfXQxie0Ny',
            columnValues: {
              cuseM: `#${counterValue}`, // Новый номер
            },
            rowID: rowId, // ID строки из запроса
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GLIDE_TOKEN}`,
        },
      }
    );

    res.status(200).json({
      rowId,
      counterValue,
      glideResponse: glideResponse.data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}