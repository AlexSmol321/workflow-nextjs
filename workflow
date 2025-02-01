import { Redis } from "@upstash/redis";
import axios from "axios";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function (workflow) {
  // Получаем rowId из тела запроса
  const { rowId } = workflow.request.body;

  // Генерируем уникальный номер
  const counterValue = await redis.incr("row_counter");

  // Обновляем строку в Glide
  const glideResponse = await axios.post(
    "https://api.glideapp.io/api/1/mutate/tables",
    {
      appID: "FUK9hUsG7w9z8PtTLtwq",
      mutations: [
        {
          kind: "set-columns-in-row",
          tableName: "native-table-iQWpW4ewfWyfXQxie0Ny",
          columnValues: { cuseM: `#${counterValue}` },
          rowID: rowId,
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GLIDE_TOKEN}`,
      },
    }
  );

  return { statusCode: 200, body: "OK" };
}
