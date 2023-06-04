import React, {useContext} from 'react';
import {Redirect, Route, Switch} from "react-router-dom"
import {publicRoutes, parentRoutes, teacherRoutes, studentRoutes} from "../routes";
import {AuthContext} from "../context";
import Loader from "./UI/Loader/Loader";
const AppRouter = () => {
    const {isAuth, isLoading} = useContext(AuthContext)
    if (isLoading) {
        return <Loader/>
    }
    return (
        isAuth
            ?
            localStorage.getItem("userType") === "parent"
                ?
                <Switch>
                    {parentRoutes.map(routes =>
                        <Route component={routes.component}
                               path={routes.path}
                               exact={routes.exact}
                               key={routes.path}
                        />
                    )}
                    <Redirect to='/home'/>
                </Switch>
                :
            localStorage.getItem("userType") === "teacher"
                ?
                <Switch>
                    {teacherRoutes.map(routes =>
                        <Route component={routes.component}
                               path={routes.path}
                               exact={routes.exact}
                               key={routes.path}
                        />
                    )}
                    <Redirect to='/home'/>
                </Switch>
                :
            localStorage.getItem("userType") === "student" ?
                <Switch>
                    {studentRoutes.map(routes =>
                        <Route component={routes.component}
                               path={routes.path}
                               exact={routes.exact}
                               key={routes.path}
                        />
                    )}
                    <Redirect to='/get_grades'/>
                </Switch>
            :
                <div>
                    Unexcepted user type
                </div>
            :
            <Switch>
                {publicRoutes.map(routes =>
                    <Route component={routes.component}
                           path={routes.path}
                           exact={routes.exact}
                           key={routes.path}
                    />
                )}
                <Redirect to='/login'/>
            </Switch>

    );
};

export default AppRouter;