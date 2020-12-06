import React, {Component} from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import {createMuiTheme, MuiThemeProvider} from "@material-ui/core/styles";
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";

import "./i18n";
import {LanguageProvider} from "./contexts/LanguageContext";
import interestTheme from "./theme";
import Routes from "./Routes";

class App extends Component {
    render() {
        return (
            <LanguageProvider>
                <MuiThemeProvider theme={createMuiTheme(interestTheme)}>
                    <CssBaseline />
                    <Router>
                        <Routes />
                    </Router>
                </MuiThemeProvider>
            </LanguageProvider>
        );
    }
}

export default App;
