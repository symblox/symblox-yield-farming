import React from "react";
import "../../App.scss";
import "../header/header.scss";

import {Container, Grid, Hidden} from "@material-ui/core";
import logo_xswap from "../../assets/symblox-logo@2x.png";

export default class App extends React.Component {
    constructor(porps) {
        super(porps);

        this.state = {};
    }

    render() {
        return (
            <div style={{background: "#051731", height: "200px"}}>
                <Container>
                    <Hidden xsDown>
                        <a
                            href={this.props.linkTo}
                            className={"header__logo"}
                            style={{
                                widht: "188px",
                                height: "auto",
                                marginTop: "83px",
                                display: "inline-block"
                            }}
                        >
                            <img
                                src={logo_xswap}
                                alt="logo"
                                style={{height: "39px"}}
                            />
                        </a>
                    </Hidden>
                    <Grid
                        container
                        spacing={3}
                        style={{
                            maxWidth: "500px",
                            float: "right",
                            fontStyle: "normal",
                            fontWeight: "300",
                            fontSize: "20px",
                            lineHeight: "28px",
                            color: "#FFFFFF",
                            mixBlendMode: "normal",
                            opacity: 0.6,
                            marginTop: "74px"
                        }}
                    >
                        <Grid item xs="auto">
                            <a href="https://twitter.com/symbloxdefi">
                                Twitter
                            </a>
                        </Grid>
                        <Grid item xs="auto">
                            <a href="https://t.me/symblox">Telegram</a>
                        </Grid>
                        <Grid item xs="auto">
                            <a href="mailto:symbloxsyx@gmail.com">
                                E-mail: symbloxsyx@gmail.com
                            </a>
                        </Grid>
                    </Grid>
                </Container>
            </div>
        );
    }
}
