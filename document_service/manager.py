import json
import os
from pathlib import Path

import asyncpg
import datetime

from aiohttp import web

routes = web.RouteTableDef()


@routes.post('/enqueue')
async def enqueue_task(request):
    try:
        request_data = await request.json()
    except Exception as e:
        return web.HTTPBadRequest()
    postgres_pool = request.app['postgres']
    request_date = datetime.datetime.now()
    document_type = request_data['type']
    status = 'created'
    # TODO сделать получение id userа
    query_str = "SELECT id FROM vkr_schema.parents where first_name = $1 and last_name = $2"
    async with postgres_pool.acquire() as postgres_conn:
        parent_id = await postgres_conn.fetchval(query_str, request_data['first_name'], request_data['last_name'])
    data = json.dumps(request_data['data'])
    query_str = "INSERT INTO vkr_schema.documentrequests " \
                "(request_date, document_type, status, parent_id, data) " \
                "values ($1, $2, $3, $4, $5) " \
                "on conflict(id) do nothing returning id; "
    async with postgres_pool.acquire() as postgres_conn:
        task_id = await postgres_conn.fetchval(query_str, request_date, document_type, status, parent_id, data)
    return web.json_response({'task_id': task_id, 'status': 'queued'})


@routes.get('/status')
async def get_task_status(request):
    try:
        request_data = await request.json()
    except Exception as e:
        return web.HTTPBadRequest()
    postgres_pool = request.app['postgres']
    async with postgres_pool.acquire() as postgres_conn:
        query_str = "SELECT id FROM vkr_schema.parents where first_name = $1 and last_name = $2"
    parent_id = await postgres_conn.fetchval(query_str, request_data['first_name'], request_data['last_name'])
    query_str = "SELECT (id, TO_CHAR(request_date, 'DD.MM.YYYY'), document_type, status)" \
                " FROM vkr_schema.documentrequests WHERE parent_id = $1"
    async with postgres_pool.acquire() as postgres_conn:
        records = await postgres_conn.fetch(query_str, parent_id)
    values = [dict(record) for record in records]
    return web.json_response(dict(data=values.reverse()))


@routes.get('/download')
async def send_task_result(request):
    task_id = int((await request.json())['task_id'])
    postgres_pool = request.app['postgres']
    query_str = "SELECT * FROM vkr_schema.documentrequests where id = $1"
    async with postgres_pool.acquire() as postgres_conn:
        row = await postgres_conn.fetchrow(query_str, task_id)
    print(row)
    if row is None:
        return web.HTTPNotFound(reason='Task not found')
    status = row['status']
    if status == "processing":
        return web.json_response({"status": status, "task_id": task_id}, status=202)
    if status != "Done successfully":
        return web.HTTPBadRequest(reason=status)
    file_path = Path(os.getcwd(), 'files_to_send', f'{task_id}.xlsx')
    try:
        if not os.path.exists(file_path):
            return web.HTTPNotFound()
        return web.FileResponse(path=file_path, status=200)
    except Exception as e:
        print(e)
        return web.HTTPBadRequest()


async def cleanup(app):
    await app['postgres'].close()


async def create_manager_app():
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


if __name__ == "__main__":
    web.run_app(create_manager_app(), host='127.0.0.1', port=8888)
