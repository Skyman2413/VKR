import asyncio
import os
from pathlib import Path

import aiofiles
import aiohttp


async def put_to_queue():
    async with aiohttp.ClientSession() as session:
        async with session.post("http://127.0.0.1:8888/enqueue", json={"data": {"sample_data": "hi"}, "type": "grades", 'first_name': "Иванов", "last_name": "Иван"}) as res:
            print(res)
            print(await res.json())


async def get_info():
    async with aiohttp.ClientSession() as session:
        async with session.get("http://127.0.0.1:8888/status", json={'first_name': "Иванов", "last_name": "Иван"}) as res:
            print(res)


async def get_file(task_id):
    async with aiohttp.ClientSession() as session:
        async with session.get(f"http://127.0.0.1:8888/download", json={"task_id": task_id}) as res:
            async with aiofiles.open(Path(os.getcwd(), "downloaded", f'{task_id}.xlsx'), 'wb') as file:
                await file.write(await res.read())

            print(res)
            print(await res.json())


async def main():
    await put_to_queue()
    # await get_info()
    # await get_file('6')


if __name__ == "__main__":
    asyncio.run(main())
