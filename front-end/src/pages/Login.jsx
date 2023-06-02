import React, {useContext, useState} from 'react';
import {AuthContext} from "../context";
import MyButton from "../components/UI/MyButton/MyButton";
import MyInput from "../components/UI/MyInput/MyInput";
import APIService from "../API/APIService";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const { setIsAuth } = useContext(AuthContext);

  const login = async event => {
    event.preventDefault();
    setError(null); // сбросить ошибку перед попыткой авторизации

    try {
      const response = await APIService.auth(username, password)

      if (response.status === 200) {
        setIsAuth(true);
        localStorage.setItem('auth', 'true');
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userType', response.data.userType)
      } else {
        throw new Error('Ошибка авторизации');
      }
    } catch (error) {
      setError('Неправильные логин или пароль');
      console.error('Ошибка:', error);
    }
  };

  return (
    <div>
      <h1>Страница авторизации</h1>
      <form onSubmit={login}>
        <MyInput
          value={username}
          onChange={e => setUsername(e.target.value)}
          type="text"
          placeholder="Введите логин"
        />
        <MyInput
          value={password}
          onChange={e => setPassword(e.target.value)}
          type="password"
          placeholder="Введите пароль"
        />
        {error && <div>{error}</div>}
        <MyButton>Войти</MyButton>
      </form>
    </div>
  );
};

export default Login;