import React from "react";
import {FormattedMessage} from "react-intl";
import config from "../../config";
import {ethToVlx} from "../../utils/vlxAddressConversion.js";
import "../../App.scss";
import "../header/header.scss";

import {Container, Grid, Hidden} from "@material-ui/core";
import logo_xswap from "../../assets/symblox-logo@2x.png";

export default class App extends React.Component {
    constructor(porps) {
        super(porps);

        this.state = {};
    }

    formatAddress = function (address) {
        if (!address) return "";
        address = ethToVlx(address);
        if (address) {
            return (
                address.substring(0, 8) +
                "..." +
                address.substring(address.length - 6, address.length)
            );
        }
    };

    render() {
        return (
            <div style={{background: "#051731", height: "280px"}}>
                <Container>
                    <Hidden mdUp>
                        <div style={{textAlign: "center"}}>
                            <a
                                href={this.props.linkTo}
                                className={"header__logo"}
                                style={{
                                    width: "188px",
                                    height: "auto",
                                    marginTop: "40px",
                                    display: "inline-block"
                                }}
                            >
                                <img
                                    src={logo_xswap}
                                    alt="logo"
                                    style={{height: "33px"}}
                                />
                            </a>
                        </div>
                        <Grid
                            container
                            spacing={3}
                            style={{
                                width: "100%",
                                fontStyle: "normal",
                                fontWeight: "300",
                                fontSize: "20px",
                                lineHeight: "22px",
                                color: "#FFFFFF",
                                mixBlendMode: "normal",
                                marginTop: "20px",
                                textAlign: "center"
                            }}
                        >
                            <Grid
                                item
                                xs={12}
                                style={{
                                    padding: "0 0 0 12px",
                                    fontSize: "16px"
                                }}
                            >
                                <a
                                    href={
                                        config.browser +
                                        "/address/" +
                                        ethToVlx(config.syx)
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FormattedMessage id="SYX" />:{" "}
                                    {this.formatAddress(config.syx)}
                                </a>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                style={{
                                    padding: "0 0 0 12px",
                                    fontSize: "16px"
                                }}
                            >
                                <a
                                    href={
                                        config.browser +
                                        "/address/" +
                                        ethToVlx(config.wvlx)
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FormattedMessage id="WVLX" />:{" "}
                                    {this.formatAddress(config.wvlx)}
                                </a>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                style={{
                                    padding: "0 0 0 12px",
                                    fontSize: "16px"
                                }}
                            >
                                <a
                                    href={
                                        config.browser +
                                        "/address/" +
                                        ethToVlx(config.devFund)
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FormattedMessage id="DEV_FUND" />:{" "}
                                    {this.formatAddress(config.devFund)}
                                </a>
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            spacing={3}
                            style={{
                                fontStyle: "normal",
                                fontWeight: "300",
                                fontSize: "20px",
                                lineHeight: "28px",
                                color: "#FFFFFF",
                                mixBlendMode: "normal",
                                // opacity: 0.6,
                                marginTop: "20px"
                            }}
                        >
                            <Grid item xs={2}></Grid>
                            <Grid item xs={2} style={{textAlign: "center"}}>
                                <a
                                    href="https://twitter.com/symbloxdefi"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <img
                                        src={"/twitter.svg"}
                                        alt="twitter"
                                        style={{height: "39px"}}
                                    />
                                </a>
                            </Grid>
                            <Grid item xs={2} style={{textAlign: "center"}}>
                                <a
                                    href="https://t.me/symblox"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <img
                                        src={"/terims.svg"}
                                        alt="terims"
                                        style={{height: "39px"}}
                                    />
                                </a>
                            </Grid>
                            <Grid item xs={2} style={{textAlign: "center"}}>
                                <a
                                    href="https://medium.com/@symbloxsyx"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <img
                                        src={"/media.svg"}
                                        alt="media"
                                        style={{height: "39px"}}
                                    />
                                </a>
                            </Grid>
                            <Grid item xs={2} style={{textAlign: "center"}}>
                                <a
                                    href="https://github.com/symblox/symblox-yield-farming"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <img
                                        src={"/github.svg"}
                                        alt="github"
                                        style={{
                                            background: "#49475F",
                                            borderRadius: "50%",
                                            padding: "6px",
                                            height: "39px"
                                        }}
                                    />
                                </a>
                            </Grid>
                            <Grid item xs={2}></Grid>
                        </Grid>
                    </Hidden>
                    <Hidden smDown>
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
                                width: "200px",
                                marginRight: "10px",
                                float: "right",
                                fontStyle: "normal",
                                fontWeight: "300",
                                fontSize: "20px",
                                lineHeight: "28px",
                                color: "#FFFFFF",
                                mixBlendMode: "normal",
                                // opacity: 0.6,
                                marginTop: "40px"
                            }}
                        >
                            <Grid item xs={12}>
                                <FormattedMessage id="COMMUNITY" />
                            </Grid>
                            <Grid item xs={3}>
                                <a
                                    href="https://twitter.com/symbloxdefi"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <img
                                        src={"/twitter.svg"}
                                        alt="twitter"
                                        style={{height: "39px"}}
                                    />
                                </a>
                            </Grid>
                            <Grid item xs={3}>
                                <a
                                    href="https://t.me/symblox"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <img
                                        src={"/terims.svg"}
                                        alt="terims"
                                        style={{height: "39px"}}
                                    />
                                </a>
                            </Grid>
                            <Grid item xs={3}>
                                <a
                                    href="https://medium.com/@symbloxsyx"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <img
                                        src={"/media.svg"}
                                        alt="media"
                                        style={{height: "39px"}}
                                    />
                                </a>
                            </Grid>
                            <Grid item xs={3}>
                                <a
                                    href="https://github.com/symblox/symblox-yield-farming"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <img
                                        src={"/github.svg"}
                                        alt="github"
                                        style={{
                                            background: "#49475F",
                                            borderRadius: "50%",
                                            padding: "6px",
                                            height: "39px"
                                        }}
                                    />
                                </a>
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            spacing={3}
                            style={{
                                width: "480px",
                                marginRight: "10px",
                                float: "right",
                                fontStyle: "normal",
                                fontWeight: "300",
                                fontSize: "20px",
                                lineHeight: "28px",
                                color: "#FFFFFF",
                                mixBlendMode: "normal",
                                // opacity: 0.6,
                                marginTop: "40px"
                            }}
                        >
                            <Grid item xs={12}>
                                <FormattedMessage id="CONTRACT" />
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                style={{
                                    padding: "0 0 0 12px",
                                    fontSize: "16px"
                                }}
                            >
                                <a
                                    href={
                                        config.browser +
                                        "/address/" +
                                        ethToVlx(config.syx)
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FormattedMessage id="SYX" />:{" "}
                                    {ethToVlx(config.syx)}
                                </a>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                style={{
                                    padding: "0 0 0 12px",
                                    fontSize: "16px"
                                }}
                            >
                                <a
                                    href={
                                        config.browser +
                                        "/address/" +
                                        ethToVlx(config.wvlx)
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FormattedMessage id="WVLX" />:{" "}
                                    {ethToVlx(config.wvlx)}
                                </a>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                style={{
                                    padding: "0 0 0 12px",
                                    fontSize: "16px"
                                }}
                            >
                                <a
                                    href={
                                        config.browser +
                                        "/address/" +
                                        ethToVlx(config.devFund)
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FormattedMessage id="DEV_FUND" />:{" "}
                                    {ethToVlx(config.devFund)}
                                </a>
                            </Grid>
                        </Grid>
                    </Hidden>
                </Container>
            </div>
        );
    }
}
