import React from "react";
import {FormattedMessage} from "react-intl";
import config from "../../config";
import {ethToVlx} from "../../utils/vlxAddressConversion.js";
import "../../App.scss";
import "../header/header.scss";

import {Container, Grid, Hidden, Link} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";

import logo_xswap from "../../assets/symblox-logo@2x.png";
import {LanguageSelector} from "../LanguageSelector";

const styles = theme => ({
    footer: {
        height: "320px",
        background: "#051731", 
        "& a": {
            color: "#ffffff"
        }
    }
});

const formatAddress = function (address) {
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

const Footer = ({classes}) => {
    return (
        <div className={classes.footer}>
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
                                    style={{
                                        height: "22px",
                                        marginTop: "28px"
                                    }}
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
                                <Link
                                    target="_blank"
                                    href={
                                        config.browser +
                                        "/address/" +
                                        ethToVlx(config.syx)
                                    }
                                >
                                    <FormattedMessage id="SYX_TOKEN" />:
                                    {formatAddress(config.syx)}
                                </Link>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                style={{
                                    fontSize: "16px",
                                    padding: "6px 0px"
                                }}
                            >
                                <Link
                                    href={
                                        config.browser +
                                        "/address/" +
                                        ethToVlx(config.wvlx)
                                    }
                                    target="_blank"
                                >
                                    <FormattedMessage id="WVLX_TOKEN" />:{" "}
                                    {formatAddress(config.wvlx)}
                                </Link>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                style={{
                                    fontSize: "16px",
                                    padding: "6px 0px"
                                }}
                            >
                                <Link
                                    href={
                                        config.browser +
                                        "/address/" +
                                        ethToVlx(config.usdt)
                                    }
                                    target="_blank"
                                >
                                    <FormattedMessage id="USDT_TOKEN" />:{" "}
                                    {formatAddress(config.usdt)}
                                </Link>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                style={{
                                    fontSize: "16px",
                                    padding: "6px 0px"
                                }}
                            >
                                <Link
                                    href={
                                        config.browser +
                                        "/address/" +
                                        ethToVlx(config.weth)
                                    }
                                    target="_blank"
                                >
                                    <FormattedMessage id="WETH_TOKEN" />:{" "}
                                    {formatAddress(config.weth)}
                                </Link>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                style={{
                                    fontSize: "16px",
                                    padding: "6px 0px"
                                }}
                            >
                                <Link
                                    href={
                                        config.browser +
                                        "/address/" +
                                        ethToVlx(config.devFund)
                                    }
                                    target="_blank"
                                >
                                    <FormattedMessage id="DEV_FUND" />:{" "}
                                    {formatAddress(config.devFund)}
                                </Link>
                            </Grid>
                            <Grid
                                container
                                item
                                xs={12}
                                style={{paddingTop: "16px"}}
                            >
                                <Grid item xs={3}>
                                    <Link
                                        href="https://twitter.com/symbloxdefi"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <img
                                            src={"/twitter.svg"}
                                            alt="twitter"
                                            style={{height: "39px"}}
                                        />
                                    </Link>
                                </Grid>
                                <Grid item xs={3}>
                                    <Link
                                        href="https://t.me/symblox"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <img
                                            src={"/terims.svg"}
                                            alt="terims"
                                            style={{height: "39px"}}
                                        />
                                    </Link>
                                </Grid>
                                <Grid item xs={3}>
                                    <Link
                                        href="https://medium.com/@symbloxsyx"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <img
                                            src={"/media.svg"}
                                            alt="media"
                                            style={{height: "39px"}}
                                        />
                                    </Link>
                                </Grid>
                                <Grid item xs={3}>
                                    <Link
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
                                    </Link>
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
                    <Grid
                        container
                        spacing={3}
                        style={{
                            fontStyle: "normal",
                            fontWeight: "300",
                            fontSize: "20px",
                            lineHeight: "28px",
                            color: "#FFFFFF",
                            mixBlendMode: "normal"
                        }}
                    >
                        <Grid item sm={6}>
                            <Grid
                                item
                                xs={12}
                                style={{padding: "32px 0 16px 0"}}
                            >
                                <FormattedMessage id="CONTRACT" />
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                style={{
                                    fontSize: "16px"
                                }}
                            >
                                <Link
                                    href={
                                        config.browser +
                                        "/address/" +
                                        ethToVlx(config.syx)
                                    }
                                    target="_blank"
                                >
                                    <FormattedMessage id="SYX_TOKEN" />:{" "}
                                    {ethToVlx(config.syx)}
                                </Link>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                style={{
                                    fontSize: "16px"
                                }}
                            >
                                <Link
                                    href={
                                        config.browser +
                                        "/address/" +
                                        ethToVlx(config.wvlx)
                                    }
                                    target="_blank"
                                >
                                    <FormattedMessage id="WVLX_TOKEN" />:{" "}
                                    {ethToVlx(config.wvlx)}
                                </Link>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                style={{
                                    fontSize: "16px"
                                }}
                            >
                                <Link
                                    href={
                                        config.browser +
                                        "/address/" +
                                        ethToVlx(config.usdt)
                                    }
                                    target="_blank"
                                >
                                    <FormattedMessage id="USDT_TOKEN" />:{" "}
                                    {ethToVlx(config.usdt)}
                                </Link>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                style={{
                                    fontSize: "16px"
                                }}
                            >
                                <Link
                                    href={
                                        config.browser +
                                        "/address/" +
                                        ethToVlx(config.weth)
                                    }
                                >
                                    <FormattedMessage id="WETH_TOKEN" />:{" "}
                                    {ethToVlx(config.weth)}
                                </Link>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                style={{
                                    fontSize: "16px"
                                }}
                            >
                                <Link
                                    href={
                                        config.browser +
                                        "/address/" +
                                        ethToVlx(config.devFund)
                                    }
                                    target="_blank"
                                >
                                    <FormattedMessage id="DEV_FUND" />:{" "}
                                    {ethToVlx(config.devFund)}
                                </Link>
                            </Grid>
                        </Grid>
                        <Grid item sm={4}>
                            <Grid
                                container
                                item
                                xs={12}
                                style={{padding: "32px 0 16px 0"}}
                            >
                                <FormattedMessage id="COMMUNITY" />
                            </Grid>
                            <Grid container item xs={12}>
                                <Grid item xs={2}>
                                    <Link
                                        href="https://twitter.com/symbloxdefi"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <img
                                            src={"/twitter.svg"}
                                            alt="twitter"
                                            style={{height: "39px"}}
                                        />
                                    </Link>
                                </Grid>
                                <Grid item xs={2}>
                                    <Link
                                        href="https://t.me/symblox"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <img
                                            src={"/terims.svg"}
                                            alt="terims"
                                            style={{height: "39px"}}
                                        />
                                    </Link>
                                </Grid>
                                <Grid item xs={2}>
                                    <Link
                                        href="https://medium.com/@symbloxsyx"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <img
                                            src={"/media.svg"}
                                            alt="media"
                                            style={{height: "39px"}}
                                        />
                                    </Link>
                                </Grid>
                                <Grid item xs={2}>
                                    <Link
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
                                    </Link>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item sm={2}>
                            <Grid
                                item
                                xs={12}
                                style={{padding: "32px 0 16px 0"}}
                            >
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
};

export default withStyles(styles)(Footer);
