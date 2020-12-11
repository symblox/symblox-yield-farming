import React from "react";
import {FormattedMessage} from "react-intl";
import config from "../../config";
import {ethToVlx} from "../../utils/vlxAddressConversion.js";
import "../../App.scss";
import "../header/header.scss";

import {Container, Grid, Hidden} from "@material-ui/core";
import logo_xswap from "../../assets/symblox-logo@2x.png";
import {LanguageSelector} from "../LanguageSelector";

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
                        <Grid
                            container
                            style={{
                                width: "100%",
                                fontStyle: "normal",
                                fontWeight: "300",
                                fontSize: "20px",
                                lineHeight: "22px",
                                color: "#FFFFFF",
                                mixBlendMode: "normal"
                            }}
                        >
                            <Grid container item xs={10}>
                                <Grid item xs={12}>
                                    <img
                                        src={logo_xswap}
                                        alt="logo"
                                        style={{height: "22px", marginTop: "28px"}}
                                    />
                                </Grid>
                                <Grid
                                    item
                                    xs={12}
                                    style={{
                                        fontSize: "16px",
                                        padding: "6px 0px"
                                    }}
                                >
                                    <a
                                        href={
                                            config.browser +
                                            "/address/" +
                                            ethToVlx(config.syxv2)
                                        }
                                        target="_blank"
                                    >
                                        <FormattedMessage id="SYX_TOKEN" />:{" "}
                                        {this.formatAddress(config.syxv2)}
                                    </a>
                                </Grid>
                                <Grid
                                    item
                                    xs={12}
                                    style={{
                                        fontSize: "16px",
                                        padding: "6px 0px"
                                    }}
                                >
                                    <a
                                        href={
                                            config.browser +
                                            "/address/" +
                                            ethToVlx(config.wvlx)
                                        }
                                        target="_blank"
                                    >
                                        <FormattedMessage id="WVLX_TOKEN" />:{" "}
                                        {this.formatAddress(config.wvlx)}
                                    </a>
                                </Grid>
                                <Grid
                                    item
                                    xs={12}
                                    style={{
                                        fontSize: "16px",
                                        padding: "6px 0px"
                                    }}
                                >
                                    <a
                                        href={
                                            config.browser +
                                            "/address/" +
                                            ethToVlx(config.usdt)
                                        }
                                        target="_blank"
                                    >
                                        <FormattedMessage id="USDT_TOKEN" />:{" "}
                                        {this.formatAddress(config.usdt)}
                                    </a>
                                </Grid>
                                <Grid
                                    item
                                    xs={12}
                                    style={{
                                        fontSize: "16px",
                                        padding: "6px 0px"
                                    }}
                                >
                                    <a
                                        href={
                                            config.browser +
                                            "/address/" +
                                            ethToVlx(config.devFund)
                                        }
                                        target="_blank"
                                    >
                                        <FormattedMessage id="DEV_FUND" />:{" "}
                                        {this.formatAddress(config.devFund)}
                                    </a>
                                </Grid>
                                <Grid container item xs={12} style={{paddingTop:"16px"}}>
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
                            </Grid>
                            <Grid container item xs={2}>
                                <Grid item xs={12}>
                                    <div style={{padding: "28px 0"}}>
                                        <FormattedMessage id="LANGUAGE" />
                                    </div>
                                    <LanguageSelector />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Hidden>

                    <Hidden smDown>
                        <img
                            src={logo_xswap}
                            alt="logo"
                            style={{height: "22px", marginTop: "40px"}}
                        />
                        <Grid container spacing={3} style={{fontStyle: "normal",
                            fontWeight: "300",
                            fontSize: "20px",
                            lineHeight: "28px",
                            color: "#FFFFFF",
                            mixBlendMode: "normal"}}>
                            <Grid item sm={6}>
                                <Grid item xs={12} style={{padding:"32px 0 16px 0"}}>
                                    <FormattedMessage id="CONTRACT" />
                                </Grid>
                                <Grid
                                    item
                                    xs={12}
                                    style={{
                                        fontSize: "16px"
                                    }}
                                >
                                    <a
                                        href={
                                            config.browser +
                                            "/address/" +
                                            ethToVlx(config.syxv2)
                                        }
                                        target="_blank"
                                    >
                                        <FormattedMessage id="SYX_TOKEN" />:{" "}
                                        {ethToVlx(config.syxv2)}
                                    </a>
                                </Grid>
                                <Grid
                                    item
                                    xs={12}
                                    style={{
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
                                    >
                                        <FormattedMessage id="WVLX_TOKEN" />:{" "}
                                        {ethToVlx(config.wvlx)}
                                    </a>
                                </Grid>
                                <Grid
                                    item
                                    xs={12}
                                    style={{
                                        fontSize: "16px"
                                    }}
                                >
                                    <a
                                        href={
                                            config.browser +
                                            "/address/" +
                                            ethToVlx(config.usdt)
                                        }
                                        target="_blank"
                                    >
                                        <FormattedMessage id="USDT_TOKEN" />:{" "}
                                        {ethToVlx(config.usdt)}
                                    </a>
                                </Grid>
                                <Grid
                                    item
                                    xs={12}
                                    style={{
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
                                    >
                                        <FormattedMessage id="DEV_FUND" />:{" "}
                                        {ethToVlx(config.devFund)}
                                    </a>
                                </Grid>
                            </Grid>
                            <Grid item sm={4}>
                                <Grid container item xs={12} style={{padding:"32px 0 16px 0"}}>
                                    <FormattedMessage id="COMMUNITY" />
                                </Grid>
                                <Grid container item xs={12}>
                                    <Grid item xs={2}>
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
                                    <Grid item xs={2}>
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
                                    <Grid item xs={2}>
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
                                    <Grid item xs={2}>
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
                            </Grid>
                            <Grid item sm={2}>
                                <Grid item xs={12} style={{padding:"32px 0 16px 0"}}>
                                    <FormattedMessage id="LANGUAGE" />
                                </Grid>
                                <Grid item xs={12}>
                                    <LanguageSelector />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Hidden>
                </Container>
            </div>
        );
    }
}
