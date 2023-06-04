import './styles/App.css';
import {AuthContext} from "./context";
import {useState, useEffect} from "react";
import {BrowserRouter, Link, Route} from "react-router-dom";
import About from "./pages/About";
import Navbar from "./components/UI/Navbar/Navbar";
import AppRouter from "./components/AppRouter";

function App() {
    const [isAuth, setIsAuth] = useState(false)
    const [isLoading, setLoading] = useState(true)

    useEffect(() => {
        if (localStorage.getItem('auth')) {
            setIsAuth(true);
        }
        setLoading(false)
        console.log(localStorage.getItem("userType"))
    }, [])
  return (
    <AuthContext.Provider value={{
        isAuth,
        setIsAuth
    }}>
        <BrowserRouter>
            <Navbar/>
            <AppRouter/>
        </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
