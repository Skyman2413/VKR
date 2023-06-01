import './App.css';
import {AuthContext} from "./context";
import {useState, useEffect} from "react";
import {BrowserRouter, Link, Route} from "react-router-dom";
import About from "./pages/About";
import Navbar from "./components/UI/Navbar/Navbar";

function App() {
    const [isAuth, setIsAuth] = useState(false)
    const [isLoading, setLoading] = useState(true)

    useEffect(() => {
        if (localStorage.getItem('auth')) {
            setIsAuth(true);
        }
        setLoading(false)
    }, [])
  return (
    <AuthContext.Provider value={{
        isAuth,
        setIsAuth
    }}>
        <BrowserRouter>
            <Navbar></Navbar>

        </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
