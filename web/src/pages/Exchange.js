import React from 'react';
import {withRouter} from "react-router-dom";

import { Header } from "../components/header";
import ExchangeSyx from "../components/ExchangeSyx";

const Exchange = () => {
    return <>
        <Header />
        <ExchangeSyx />
    </>;
};

export default withRouter(Exchange);