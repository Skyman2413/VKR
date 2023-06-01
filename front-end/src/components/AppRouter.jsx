import React, {useContext} from 'react';
import {Redirect, Route, Switch} from "react-router-dom"
import {publicRoutes, privateRoutes} from "../routes";
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
            <Switch>
                {privateRoutes.map(routes =>
                    <Route component={routes.component}
                           path={routes.path}
                           exact={routes.exact}
                           key={routes.path}
                    />
                )}
                <Redirect to='/home'/>
            </Switch>
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