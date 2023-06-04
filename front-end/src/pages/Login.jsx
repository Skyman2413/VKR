import React, {useContext, useState} from 'react';
import {AuthContext} from "../context";
import MyButton from "../components/UI/MyButton/MyButton";
import MyInput from "../components/UI/MyInput/MyInput";
import APIService from "../API/APIService";
import {useFetching} from "../hook/useFetching";
import Loader from "../components/UI/Loader/Loader";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { setIsAuth } = useContext(AuthContext);
  const [fetchLogin, isLoginProcessing, loginError] = useFetching(async (username, password) =>{
    const response = await APIService.auth(username, password)
    setIsAuth(true);
    localStorage.setItem('auth', 'true');
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('userType', response.data.userType)

  })
  const login = async event => {
    event.preventDefault();
    await fetchLogin(username, password)
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
        {isLoginProcessing &&
            <div style={{display: 'flex', justifyContent: 'center', marginTop: 50}}><Loader/></div>
        }
        {loginError &&
            <h1>Произошла ошибка ${loginError}</h1>
        }
        <MyButton>Войти</MyButton>
      </form>
    </div>
  );
};

export default Login;