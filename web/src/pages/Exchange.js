import React from 'react';
import {withRouter} from "react-router-dom";

import { Header } from "../components/header";
import ExchangeSyx from "../components/ExchangeSyx";

const Exchange = () => {
    return <>
        <Header show={true} linkTo={"/"} />
        <ExchangeSyx />
    </>;
};

export default withRouter(Exchange);