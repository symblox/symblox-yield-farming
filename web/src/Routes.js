import React from "react";
import {Redirect, Route, Switch} from "react-router-dom";

import Home from "./components/home";
import Page404 from "./components/Page404";

const Routes = () => (
    <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/404" component={Page404} />
        <Route path="*" component={Page404} />
    </Switch>
);
export default Routes;
