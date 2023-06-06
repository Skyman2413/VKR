import asyncio

import asyncpg
import bcrypt


async def create_parent(first_name, last_name, phone_number, email, login, pwd):
    pool = await create_connection()
    async with pool.acquire() as conn:
        query_str = """INSERT INTO vkr_schema.parents
         (first_name, last_name, phone_number, email, login, password_hash)
         VALUES 
         ($1, $2, $3, $4, $5, $6)"""
        await conn.fetch(query_str, first_name, last_name, phone_number,
                         email, login, bcrypt.hashpw(pwd.encode("utf-8"), bcrypt.gensalt()))


async def create_student(first_name, last_name, login, pwd):
    pool = await create_connection()
    async with pool.acquire() as conn:
        query_str = """INSERT INTO vkr_schema.students
         (first_name, last_name, group_id, parent_id, login, password_hash)
         VALUES 
         ($1, $2, $3, $4, $5, $6)"""
        await conn.fetch(query_str, first_name, last_name, 1,
                         4, login, bcrypt.hashpw(pwd.encode("utf-8"), bcrypt.gensalt()))


async def create_connection():
    pool = await asyncpg.create_pool(
        host="192.168.3.16",
        port="5432",
        database="vkr",
        user="documentcreator",
        password="gjhnatkm"
    )
    return pool


async def main():
    # await create_parent("Учитель", "Учителев", "89999999999", "teacher@mail.ru", "parent", "parent")
    await create_student("Ученик", "Учеников", "student", "student")


if __name__ == "__main__":
    asyncio.run(main())
