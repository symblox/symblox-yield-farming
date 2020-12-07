import React from "react";
import {Redirect, Route, Switch} from "react-router-dom";

import Home from "./components/home";
import ExchangeSyx from "./pages/ExchangeSyx";

const Routes = () => (
    <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/exchangeSyx" component={ExchangeSyx} />
        <Route path="*" component={Home} />
    </Switch>
);
export default Routes;
