import React from "react";
import {withRouter} from "react-router-dom";

import {Header} from "../components/header";
import Footer from "../components/footer";
import ExchangeSyx from "../components/ExchangeSyx";

const Exchange = () => {
    return (
        <>
            <Header />
            <ExchangeSyx />
            <Footer />
        </>
    );
};

export default withRouter(Exchange);
