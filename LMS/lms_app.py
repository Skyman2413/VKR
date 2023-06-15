import datetime
import json
import logging
import os
from os.path import exists
from pathlib import Path

import aiofiles
import asyncpg
import bcrypt
import jwt
from aiohttp import web
from aiohttp_middlewares import cors_middleware

routes = web.RouteTableDef()
front_end_ip = 'http://localhost:3000'


async def generate_token(user_id, user_type):
    payload = {
        'user_id': user_id,
        'user_type': user_type,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }
    token = jwt.encode(payload, 'secret', algorithm='HS256')

    return token


async def verify_token(token):
    try:
        payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # token is expired
    except jwt.InvalidTokenError:
        return None  # token is invalid


@web.middleware
async def jwt_middleware(request, handler):
    if request.method == 'OPTIONS':
        # Обработка предварительных запросов
        response = web.Response()
        await add_cors_headers(response)
        return response

    if request.path == '/auth':
        return await handler(request)

    token = request.headers.get('Authorization', None)
    if token is not None:
        payload = await verify_token(token)
        if payload is not None:
            request.user = payload
            response = await handler(request)
            await add_cors_headers(response)
            return response

    response = web.HTTPUnauthorized()
    await add_cors_headers(response)
    return response


@routes.post('/auth')
async def post_auth(request):
    postgres_pool = request.app['postgres']
    metadata = await request.json()
    login = metadata['username']
    async with postgres_pool.acquire() as postgres_conn:
        student = await postgres_conn.fetchrow(
            'SELECT password_hash, id FROM vkr_schema.students WHERE login = $1', login)
        teacher = await postgres_conn.fetchrow(
            'SELECT password_hash, id FROM vkr_schema.teachers WHERE login = $1', login)
        parent = await postgres_conn.fetchrow(
            'SELECT password_hash, id FROM vkr_schema.parents WHERE login = $1', login)

    user_type = None
    password_hash = None

    if student:
        user_type = 'student'
        password_hash, user_id = student
    elif teacher:
        user_type = 'teacher'
        password_hash, user_id = teacher
    elif parent:
        user_type = 'parent'
        password_hash, user_id = parent
    else:
        response = web.HTTPUnauthorized()
        await add_cors_headers(response)
        return response

    password_matches = bcrypt.checkpw(metadata['password'].encode('utf-8'), password_hash)
    if password_matches:
        response = web.json_response(status=200, data={
            "userType": user_type,
            "token": await generate_token(user_id, user_type)
        })

    else:
        response = web.HTTPUnauthorized()
        response.text = "Неверный пароль"
    await add_cors_headers(response)
    return response


async def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = front_end_ip
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'


@routes.get('/shedule')
async def get_shedule(request):
    postgres_pool = request.app['postgres']
    metadata = await request.json()

    group_name = metadata['group_name']
    query_str = "SELECT vkr_schema.timetable.lesson_number, vkr_schema.subjects.subject_name AS subject_name," \
                "vkr_schema.teachers.first_name || ' ' || vkr_schema.teachers.last_name AS teacher_name, " \
                "vkr_schema.timetable.lesson_date " \
                "FROM vkr_schema.timetable " \
                "JOIN vkr_schema.groups ON vkr_schema.timetable.group_id = vkr_schema.groups.id " \
                "JOIN vkr_schema.subjects ON vkr_schema.timetable.subject_id = vkr_schema.subjects.id " \
                "JOIN vkr_schema.teachers ON vkr_schema.timetable.teacher_id = vkr_schema.teachers.id " \
                "WHERE vkr_schema.groups.group_name = $1 " \
                "ORDER BY vkr_schema.timetable.lesson_date, vkr_schema.timetable.lesson_number;"
    async with postgres_pool.acquire() as postgres_conn:
        result = await postgres_conn.fetch(query_str, group_name)
    timetable = [row for row in result]
    return web.json_response(dict(shedule=timetable))


@routes.get('/student_grades')
async def get_student_grades(request):
    postgres_pool = request.app['postgres']
    if request.user["user_type"] == "student":
        student_id = request.user["user_id"]
    else:
        query_str = "SELECT id FROM vkr_schema.students WHERE parent_id=$1"
        async with postgres_pool.acquire() as conn:
            student_id = conn.fetchval(query_str, request.user['user_id'])
    query_str = """SELECT TO_CHAR(vkr_schema.grades.date, 'DD.MM.YYYY'), vkr_schema.grades.grade, vkr_schema.grades.grade_type,
                   vkr_schema.subjects.subject_name as subject_name
                   FROM vkr_schema.grades 
                   JOIN vkr_schema.subjects ON vkr_schema.grades.subject_id = vkr_schema.subjects.id
                   WHERE vkr_schema.grades.student_id = $1 
                   ORDER BY vkr_schema.grades.date, subject_name"""
    async with postgres_pool.acquire() as postgres_conn:
        data = await postgres_conn.fetch(query_str, student_id)
    grouped_data = {}
    for record in data:
        subject_name = record['subject_name']
        grade = record['grade']
        to_char = record['to_char']
        grade_type = record['grade_type']

        if subject_name not in grouped_data:
            grouped_data[subject_name] = []

        grouped_data[subject_name].append({"grade": grade, "date": to_char, "grade_type": grade_type})

    result = [{"subject": subject_name, "grades": grades} for subject_name, grades in grouped_data.items()]

    return web.json_response(dict(grades=result))


@routes.put('/create_homework')
async def create_homework(request):
    """важно чтобы сначала шла часть с json, а только потом с файлом"""
    postgres_pool = request.app['postgres']
    reader = await request.multipart()

    metadata = None
    field = await reader.next()
    while field:
        if field.name == 'data':
            data_text = await field.text()
            metadata = json.loads(data_text)
            break
        field = await reader.next()
    description = metadata['description']
    due_data = datetime.datetime.strptime(metadata['due_date'], "%d.%m.%Y")
    user_id = request.user["user_id"]
    subject_name = metadata['subject_name']
    group_name = metadata['group_name']
    query_str = """INSERT INTO vkr_schema.homework (description, due_date, teacher_id, subject_id, group_id)
                    VALUES (
                        $1, 
                        $2, 
                        $3,
                        (SELECT id FROM vkr_schema.subjects WHERE subject_name = $4),
                        (SELECT id FROM vkr_schema.groups WHERE group_name = $5)
                    )
                    RETURNING id;"""

    async with postgres_pool.acquire() as postgres_conn:
        id = await postgres_conn.fetchval(query_str, description, due_data,
                                          user_id,
                                          subject_name, group_name)
    if "include" in metadata.keys():
        field = await reader.next()
        while field:
            if field.name == 'file':
                file_extension = os.path.splitext(field.filename)[1]
                path = Path(os.getcwd(), 'homework_includings', f'teaher_{id}{file_extension}')
                async with aiofiles.open(path, 'wb') as f:
                    while True:
                        chunk = await field.read_chunk()
                        if not chunk:
                            break
                        await f.write(chunk)
                break
            field = await reader.next()

    return web.HTTPOk()


@routes.put('/send_homework')
async def put_done_homework(request):
    postgres_pool = request.app['postgres']
    reader = await request.multipart()

    metadata = None
    field = await reader.next()
    while field:
        if field.name == 'data':
            data_text = await field.text()
            metadata = json.loads(data_text)
            break

        field = await reader.next()

    hm_id = metadata['hm_id']
    user_id = request.user["user_id"]

    field = await reader.next()
    while field:
        if field.name == 'file':
            file_extension = os.path.splitext(field.filename)[1]
            path = Path(os.getcwd(), 'homework_includings', f'student_{user_id}_{hm_id}{file_extension}')
            async with aiofiles.open(path, 'wb') as f:
                while True:
                    chunk = await field.read_chunk()
                    if not chunk:
                        break
                    await f.write(chunk)
            break
        field = await reader.next()

    query_str = """INSERT INTO vkr_schema.homeworksubmissions 
                (homework_id, student_id, submission_date) 
                VALUES 
                ($1,
                $2,
                $3)"""
    async with postgres_pool.acquire() as postgres_conn:
        await postgres_conn.fetch(query_str, hm_id, user_id, datetime.date.today())

    return web.HTTPOk()


@routes.put('/grade_homework')
async def put_grade_hm(request):
    postgres_pool = request.app['postgres']
    metadata = await request.json()
    submission_id = metadata["id"]
    grade = metadata["grade"]
    try:
        comment = metadata["comment"]
    except:
        comment = None
    query_str = """UPDATE vkr_schema.homeworksubmissions 
    SET grade = $1, comments = $2 WHERE submission_id = $3 RETURNING homework_id, student_id"""
    async with postgres_pool.acquire() as postgres_conn:
        result = await postgres_conn.fetchrow(query_str, grade, comment, submission_id)
    query_str = """INSERT INTO vkr_schema.grades
    (grade, date, student_id, teacher_id, grade_type, subject_id) 
    VALUES
     ($1, $2, $3, 
     (SELECT teacher_id FROM vkr_schema.homework where id = $4), 
     'homework', 
     (SELECT subject_id FROM vkr_schema.homework WHERE id = $4)
    )"""
    async with postgres_pool.acquire() as postgres_conn:
        await postgres_conn.fetch(query_str, grade, datetime.date.today(), result["student_id"],
                                  result['homework_id'])

    return web.HTTPOk()


@routes.get('/get_groups')
async def get_groups(request):
    postgres_pool = request.app['postgres']
    teacher_id = request.user['user_id']
    query_str = """ SELECT vkr_schema.groups.group_name, vkr_schema.groups.id
                    FROM vkr_schema.groups 
                    WHERE vkr_schema.groups.id =
                     (SELECT vkr_schema.teachers_groups.group_id
                      FROM vkr_schema.teachers_groups
                        WHERE teacher_id = $1)
                """
    async with postgres_pool.acquire() as conn:
        result = await conn.fetch(query_str, teacher_id)

    print(result)
    to_send = {
        "groups": [
            {
                "id": record['id'],
                "name": record['group_name']
            }
            for record in result
        ]
    }
    return web.json_response(to_send)


@routes.post('/get_subjects')
async def post_get_subjects(request):
    postgres_pool = request.app['postgres']
    data = await request.json()
    group_name = data['group']
    teacher_id = request.user['user_id']
    query_str = """SELECT vkr_schema.subjects.subject_name, vkr_schema.subjects.id
                    FROM vkr_schema.subjects
                    JOIN vkr_schema.teachers_subjects 
                        ON subjects.id = vkr_schema.teachers_subjects.subject_id
                    JOIN vkr_schema.teachers_groups 
                        ON vkr_schema.teachers_subjects.teacher_id = vkr_schema.teachers_groups.teacher_id
                    JOIN vkr_schema.groups 
                        ON vkr_schema.teachers_groups.group_id = groups.id
                    WHERE vkr_schema.teachers_subjects.teacher_id = $1 AND groups.group_name = $2;
                """
    async with postgres_pool.acquire() as conn:
        result = await conn.fetch(query_str, teacher_id, group_name)
    to_send = {
        "subjects": [
            {
                "id": record['id'],
                "name": record['subject_name']
            }
            for record in result
        ]
    }
    return web.json_response(to_send)


@routes.post('/update_grades')
async def update_grades(request):
    postgres_pool = request.app['postgres']
    data = await request.json()
    grade = int(data['grade'])
    comment = data['comment']
    teacher_id = request.user['user_id']
    student_id = int(data['studentId'])
    subject_name = data['subject_name']
    date = data['date']
    grade_type = data['grade_type']
    # Обновляем оценки в базе данных
    async with postgres_pool.acquire() as conn:
        await conn.fetch('''
                INSERT INTO vkr_schema.grades (student_id, date, grade, comment, lesson_id, teacher_id, subject_id, grade_type)
                VALUES ($1, to_date($2, 'DD.MM.YYYY'), $3, $4, 
                (SELECT id FROM vkr_schema.timetable where lesson_date = to_date($2, 'DD.MM.YYYY')),
                 $5, 
                 (SELECT id FROM vkr_schema.subjects WHERE subject_name =$6),
                 $7)
                 
                ON CONFLICT (student_id, lesson_id, grade_type)
                DO UPDATE SET grade = $3, comment = $4, teacher_id = $5
            ''', student_id, date, grade, comment, teacher_id, subject_name, grade_type)
    return web.Response()


@routes.post('/group_grades')
async def post_get_group_grades(request):
    postgres_pool = request.app['postgres']
    data = await request.json()
    group_name = data['group_name']
    subject_name = data['subject_name']
    teacher_id = request.user["user_id"]

    async with postgres_pool.acquire() as conn:
        subject_id = await conn.fetchval('''
                SELECT vkr_schema.subjects.id FROM vkr_schema.subjects WHERE vkr_schema.subjects.subject_name = $1
            ''', subject_name)

    async with postgres_pool.acquire() as conn:
        group_id = await conn.fetchval('''
                SELECT id FROM vkr_schema.groups WHERE group_name = $1
            ''', group_name)

    async with postgres_pool.acquire() as conn:
        lessons = await conn.fetch('''
                SELECT vkr_schema.timetable.id, TO_CHAR(vkr_schema.timetable.lesson_date, 'DD.MM.YYYY') as lesson_date
                FROM vkr_schema.timetable
                WHERE vkr_schema.timetable.teacher_id = $1 
                AND vkr_schema.timetable.subject_id = $2 
                AND vkr_schema.timetable.group_id = $3
            ''', teacher_id, subject_id, group_id)

    # Получим список студентов группы
    async with postgres_pool.acquire() as conn:
        students = await conn.fetch('''
            SELECT vkr_schema.students.id, 
            vkr_schema.students.first_name || ' ' || vkr_schema.students.last_name 
            AS student_name 
            FROM vkr_schema.students 
            WHERE vkr_schema.students.group_id = $1
        ''', group_id)

    # Создадим пустую структуру данных
    data = {}
    for student in students:
        data[student['id']] = {'name': student['student_name']}

    # Заполняем структуру данными об оценках
    for lesson in lessons:
        for student_id in data.keys():
            async with postgres_pool.acquire() as conn:
                result = await conn.fetch('''
                        SELECT vkr_schema.grades.grade, vkr_schema.grades.grade_type FROM vkr_schema.grades 
                        WHERE vkr_schema.grades.student_id = $1 AND vkr_schema.grades.lesson_id = $2
                    ''', student_id, lesson['id'])

            # Если оценки нет, оставим ячейку пустой
            for row in result:
                grade, grade_type = row
                if grade is None:
                    grade = ''
                    grade_type = "класс"

                data[student_id][lesson['lesson_date'] + f' {grade_type}' if grade_type else ''] = grade
            if len(result) == 0:
                data[student_id][lesson['lesson_date']] = ""

    print(data)
    return web.json_response(data)


@routes.get('/get_homeworks')
async def get_gomeworks(request):
    postgres_pool = request.app['postgres']
    student_id = request.user["user_id"]

    async with postgres_pool.acquire() as conn:
        group_id = await conn.fetchval('SELECT group_id FROM vkr_schema.students WHERE id=$1', student_id)

        # Получаем ДЗ для этой группы
        homeworks = await conn.fetch('SELECT * FROM vkr_schema.homework WHERE group_id=$1', group_id)

        # Преобразуем записи в нужный формат и добавляем информацию о сдаче
        homework_list = []
        for hw in homeworks:
            # Получаем имя предмета
            subject_name = await conn.fetchval('SELECT subject_name FROM vkr_schema.subjects WHERE id=$1', hw['subject_id'])

            # Проверяем, сдано ли домашнее задание
            is_submitted = await conn.fetchval(
                'SELECT COUNT(*) FROM vkr_schema.homeworksubmissions WHERE student_id=$1 AND homework_id=$2', student_id,
                hw['id']) > 0

            homework_list.append({
                "id": hw["id"],
                "description": hw["description"],
                "due_date": hw["due_date"].isoformat(),
                "subject": subject_name,
                "is_submitted": is_submitted,
                "teacher_file_exists": False
            })

    return web.json_response({"homeworks": homework_list})


async def create_lms_app():
    logging.basicConfig(level=logging.INFO)

    app = web.Application()
    app.add_routes(routes)
    app.middlewares.append(jwt_middleware)
    app.middlewares.append(cors_middleware())

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
