import React, {useContext} from 'react';
import {AuthContext} from "../context";
import MyButton from "../components/UI/MyButton/MyButton";
import MyInput from "../components/UI/MyInput/MyInput";

const Login = () => {

    const {isAuth, setIsAuth} = useContext(AuthContext)
    const login = event => {
        event.preventDefault()
        setIsAuth(true)
        localStorage.setItem('auth', 'true')

    }
    return (
        <div>
            <h1>Страница авторизации</h1>
            <form onSubmit={login}>
                <MyInput type="text" placeholder="Введите логин"/>
                <MyInput type="password" placeholder="Введите пароль"/>
                <MyButton>Войти</MyButton>
            </form>
        </div>
    );
};

export default Login;