import json
import os
from pathlib import Path

import asyncpg
import datetime

from aiohttp import web

routes = web.RouteTableDef()


@routes.get('/shedule')
def get_shedule(request):
    postgres_pool = request.app['postgres']
    metadata = await request.json()
    group_id = metadata['group_id']
    query_str = "SELECT (day_of_week, lesson_number, group_id, subject_id, teacher_id) " \
                "FROM vkr_schema.timetable where group_id = $1;"
    async with postgres_pool.acquire() as postgres_conn:
        postgres_conn.fetchrow(query_str, group_id)


async def create_lms_app():
    app = web.Application()
    app.add_routes(routes)
    pool = await asyncpg.create_pool(
        host="192.168.3.16",
        port="5432",
        database="vkr",
        user="documentcreator",
        password="gjhnatkm"
    )
    app['postgres'] = pool
    app.on_cleanup.append(cleanup)
    return app


async def cleanup(app):
    await app['postgres'].close()


if __name__ == "__main__":
    web.run_app(create_lms_app(), host='127.0.0.2', port=8888)
