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
                            style={{height: "33px"}}
                        />
                    </a>
                    <Grid
                        container
                        spacing={3}
                        style={{
                            width: "160px",
                            marginRight: "10px",
                            float: "right",
                            fontStyle: "normal",
                            fontWeight: "300",
                            fontSize: "20px",
                            lineHeight: "28px",
                            color: "#FFFFFF",
                            mixBlendMode: "normal",
                            // opacity: 0.6,
                            marginTop: "68px"
                        }}
                    >
                        <Grid item xs={4}>
                            <a href="https://twitter.com/symbloxdefi">
                                <img
                                    src={"/twitter.svg"}
                                    alt="logo"
                                    style={{height: "39px"}}
                                />
                            </a>
                        </Grid>
                        <Grid item xs={4}>
                            <a href="https://t.me/symblox">
                                <img
                                    src={"/terims.svg"}
                                    alt="logo"
                                    style={{height: "39px"}}
                                />
                            </a>
                        </Grid>
                        <Grid item xs={4}>
                            <a href="https://medium.com/@symbloxsyx">
                                <img
                                    src={"/media.svg"}
                                    alt="logo"
                                    style={{height: "39px"}}
                                />
                            </a>
                        </Grid>
                    </Grid>
                </Container>
            </div>
        );
    }
}
