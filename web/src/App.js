import React, {Component} from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import {createMuiTheme, MuiThemeProvider} from "@material-ui/core/styles";
import {BrowserRouter as Router} from "react-router-dom";

import "./i18n";
import {LanguageProvider} from "./contexts/LanguageContext";
import {Web3Provider} from "./contexts/Web3Context";
import {PoolContextProvider} from "./contexts/PoolContext";

import interestTheme from "./theme";
import Routes from "./Routes";

class App extends Component {
    render() {
        return (
            <LanguageProvider>
                <MuiThemeProvider theme={createMuiTheme(interestTheme)}>
                    <CssBaseline />
                    <Web3Provider>
                        <PoolContextProvider>
                            <Router>
                                <Routes />
                            </Router>
                        </PoolContextProvider>
                    </Web3Provider>
                </MuiThemeProvider>
            </LanguageProvider>
        );
    }
}

export default App;
