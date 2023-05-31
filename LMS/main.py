import json
import os
from pathlib import Path

import aiofiles
import asyncpg
import datetime

from aiohttp import web

routes = web.RouteTableDef()


@routes.get('/shedule')
def get_shedule(request):
    postgres_pool = request.app['postgres']
    metadata = await request.json()
    group_name = metadata['group_name']
    query_str = "SELECT vkr_schema.timetable.lesson_number, vkr_schema.subjects.subject_name AS subject_name," \
                "vkr_schema.teachers.first_name || ' ' || vkr_schema.teachers.last_name AS teacher_name, " \
                "vkr_schema.timetable.day_of_week " \
                "FROM vkr_schema.timetable " \
                "JOIN vkr_schema.groups ON vkr_schema.timetable.group_id = vkr_schema.groups.id " \
                "JOIN vkr_schema.subjects ON vkr_schema.timetable.subject_id = vkr_schema.subjects.id " \
                "JOIN vkr_schema.teachers ON vkr_schema.timetable.teacher_id = vkr_schema.teachers.id " \
                "WHERE vkr_schema.groups.group_name = $1 " \
                "ORDER BY vkr_schema.timetable.day_of_week, vkr_schema.timetable.lesson_number;"
    async with postgres_pool.acquire() as postgres_conn:
        result = postgres_conn.fetch(query_str, group_name)
    timetable = [row for row in result]
    return web.json_response(dict(shedule=timetable))


@routes.get('/student_grades')
async def get_student_grades(request):
    postgres_pool = request.app['postgres']
    metadata = await request.json()
    student_first_name = metadata['first_name']
    student_last_name = metadata['last_name']
    query_str = """SELECT id FROM vkr_schema.students WHERE first_name = $1 and last_name = $2"""
    async with postgres_pool.acquire() as postgres_conn:
        student_id = postgres_conn.fetchval(query_str, student_first_name, student_last_name)
    query_str = """SELECT vkr_schema.grades.date, vkr_schema.grades.grade, vkr_schema.grades.grade_type,
                   vkr_schema.subjects.subject_name as subject_name
                   FROM vkr_schema.grades 
                   JOIN vkr_schema.subjects ON vkr_schema.grades.subject_id = vkr_schema.subjects.id
                   WHERE vkr_schema.grades.student_id = $1 
                   ORDER BY vkr_schema.grades.date, subject_name"""
    async with postgres_pool.acquire() as postgres_conn:
        result = postgres_conn.fetchval(query_str, student_id)
    to_send = [row for row in result]
    return web.json_response(dict(grades=to_send))


@routes.put('/create_homework')
async def put_homework(request):
    postgres_pool = request.app['postgres']
    metadata = await request.json()
    description = metadata['description']
    due_data = datetime.datetime.strptime(metadata['due_date'], "%d.%m.%Y")
    teacher_first_name = metadata['teacher_first_name']
    teacher_last_name = metadata['teacher_last_name']
    subject_name = metadata['subject_name']
    group_name = metadata['group_name']
    query_str = """INSERT INTO vkr_schema.homework (description, due_date, teacher_id, subject_id, group_id)
                    VALUES (
                        $1, 
                        $2, 
                        (SELECT id FROM vkr_schema.teachers WHERE first_name = $3 AND last_name = $4),
                        (SELECT id FROM vkr_schema.subjects WHERE subject_name = $5),
                        (SELECT id FROM vkr_schema.groups WHERE group_name = $6)
                    )
                    RETURNING id;"""

    async with postgres_pool.acquire() as postgres_conn:
        id = postgres_conn.valfetch(query_str, description, due_data,
                            teacher_first_name, teacher_last_name, subject_name, group_name)
    if metadata['include']:
        reader = await request.multipart()
        field = await reader.next()
        path = Path(os.getcwd(), 'homework_includings', f'teaher_{id}')
        async with aiofiles.open(path, 'wb') as f:
            while True:
                chunk = await field.read_chunk()
                if not chunk:
                    break
                await f.write(chunk)
    return web.HTTPOk()


@routes.put('/send_homework')
async def put_done_homework(request):
    postgres_pool = request.app['postgres']
    metadata = await request.json()

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
