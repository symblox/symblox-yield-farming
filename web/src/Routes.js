import React from "react";
import {Redirect, Route, Switch} from "react-router-dom";

import Home from "./components/home";
import Exchange from "./pages/Exchange";

const Routes = () => (
    <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/exchange" component={Exchange} />
        <Route path="*" component={Home} />
    </Switch>
);
export default Routes;
