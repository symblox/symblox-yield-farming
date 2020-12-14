import React, {useContext} from "react";
import "../../App.scss";
import "./header.scss";
import {Link, AppBar, Toolbar, IconButton, Hidden, Drawer} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {FormattedMessage} from "react-intl";
import Menu from "@material-ui/icons/Menu";

import logo_xswap from "../../assets/symblox-logo@2x.png";

import {WalletSelector} from "../WalletSelector";

const useStyles = makeStyles({
    bar: {
        background: "inherit",
        boxShadow: "inherit",
        padding: "32px 0",
        maxWidth: "1200px",
        margin: "auto"
    },
    growFlex: {
        flexGrow: 1,
        textAlign: "right",
        fontSize: "20px"
    },
    link: {
        color: "white",
        padding: "0 12px"
    },
    mobileLink: {
        color: "white",
        display: "block",
        padding: "16px 32px",
        fontSize: "18px",
        // "& a": {
        //     textDecoration: "none"
        // },

        "&:hover": {
            backgroundColor: "white",
            color: "black"
        }
    },
    drawerPaper: {
        border: "none",
        transitionProperty: "top, bottom, width",
        transitionDuration: ".2s, .2s, .35s",
        transitionTimingFunction: "linear, linear, ease",
        width: "100%",
        boxShadow:
            "0 10px 30px -12px rgba(0, 0, 0, 0.42), 0 4px 25px 0px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.2)",
        position: "fixed",
        display: "block",
        top: "120px",
        right: "0",
        left: "auto",
        visibility: "visible",
        overflowY: "visible",
        borderTop: "none",
        textAlign: "left",
        paddingRight: "0px",
        paddingLeft: "0",
        // transition: "all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)",
        backgroundColor: "black",
        opacity: 0.7
    }
});

export const Header = () => {
    const classes = useStyles();
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <AppBar className={classes.bar} position="static">
            <Toolbar className={classes.container}>
                <div className={classes.flex}>
                    <Link href="https://new.symblox.io">
                    <img
                        src={logo_xswap}
                        alt="logo"
                        style={{height: "32px", marginTop: "4px"}}
                    />
                    </Link>
                </div>
                <div className={classes.growFlex}>
                    <Hidden xsDown implementation="css">
                        <Link href="/exchange" className={classes.link}>
                            <FormattedMessage id="SYX_TOKEN_EXCHANGE" />
                        </Link>
                        <Link
                            href="https://app.symblox.io"
                            className={classes.link}
                        >
                            <FormattedMessage id="DAPP_MINING_OLD" />
                        </Link>
                        <Link
                            href="https://x.symblox.io"
                            className={classes.link}
                        >
                            <FormattedMessage id="DAPP_CROSS_CHAIN" />
                        </Link>
                    </Hidden>
                </div>
                <WalletSelector />
                <Hidden smUp>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerToggle}
                    >
                        <Menu />
                    </IconButton>
                </Hidden>
            </Toolbar>
            <Hidden smUp implementation="js">
                <Drawer
                    variant="temporary"
                    anchor={"top"}
                    open={mobileOpen}
                    classes={{
                        paper: classes.drawerPaper
                    }}
                    onClose={handleDrawerToggle}
                >
                    <div className={classes.appResponsive}>
                        <Link href="/exchange" className={classes.mobileLink}>
                            <FormattedMessage id="SYX_TOKEN_EXCHANGE" />
                        </Link>
                        <Link
                            href="https://app.symblox.io"
                            className={classes.mobileLink}
                        >
                            <FormattedMessage id="DAPP_MINING_OLD" />
                        </Link>
                        <Link
                            href="https://x.symblox.io"
                            className={classes.mobileLink}
                        >
                            <FormattedMessage id="DAPP_CROSS_CHAIN" />
                        </Link>
                    </div>
                </Drawer>
            </Hidden>
        </AppBar>
    );
};
