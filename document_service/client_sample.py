import asyncio
import json
import os
from pathlib import Path

import aiofiles
import aiohttp
from aiohttp import FormData


async def put_to_queue():
    async with aiohttp.ClientSession() as session:
        async with session.post("http://127.0.0.1:8888/enqueue",
                                json={"data": {"sample_data": "hi"}, "type": "grades", 'first_name': "Иванов",
                                      "last_name": "Иван"}) as res:
            print(res)
            print(await res.json())


async def get_info():
    async with aiohttp.ClientSession() as session:
        async with session.get("http://127.0.0.1:8888/status",
                               json={'first_name': "Иванов", "last_name": "Иван"}) as res:
            print(res)


async def get_file(task_id):
    async with aiohttp.ClientSession() as session:
        async with session.get(f"http://127.0.0.1:8888/download", json={"task_id": task_id}) as res:
            async with aiofiles.open(Path(os.getcwd(), "downloaded", f'{task_id}.xlsx'), 'wb') as file:
                await file.write(await res.read())

            print(res)
            print(await res.json())


async def create_homework():
    async with aiohttp.ClientSession() as session:
        data = FormData()
        with open(r"C:\Users\Степан\Documents\Учеба\ВКР\Диаграммы\er-diagramm.png", 'rb') as file:
            data.add_field('data',
                           json.dumps({"description": "some_descr", "due_date": "22.06.2023",
                                       "teacher_first_name": "Петров", "teacher_last_name": "Петр",
                                       "group_name": "Group1", "subject_name": "Math",
                                       "include": True}),
                           content_type='application/json')
            data.add_field('file',
                           file,
                           filename='er.png',
                           content_type='image/png')
            async with session.put("http://127.0.0.2:8888/create_homework", data=data) as res:
                print(res.status)
                print(await res.text())


async def main():
    await put_to_queue()
    # await get_info()
    # await get_file('6')


if __name__ == "__main__":
    asyncio.run(main())
