import React, {useContext} from "react";
import "../../App.scss";
import "./header.scss";
import Link from '@material-ui/core/Link';
import { makeStyles } from "@material-ui/core/styles";
import {FormattedMessage} from "react-intl";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Hidden from "@material-ui/core/Hidden";
import Drawer from "@material-ui/core/Drawer";
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
        textAlign: "center",
        fontSize: "20px"
    },
    link: {
        color: "white",
        padding: "0 6px"
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
        boxShadow: "0 10px 30px -12px rgba(0, 0, 0, 0.42), 0 4px 25px 0px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.2)",
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
                    <img
                        src={logo_xswap}
                        alt="logo"
                        style={{height: "22px", marginTop: "4px"}}
                    />
                </div>
                <div className={classes.growFlex}>
                    <Hidden xsDown implementation="css">            
                        <Link href="/" className={classes.link}>
                            <FormattedMessage id="HOME" />
                        </Link>
                        <Link href="/exchange" className={classes.link}>
                            <FormattedMessage id="EXCHANGE" />
                        </Link>
                        <Link href="/app.symblox.io" className={classes.link}>
                            <FormattedMessage id="V1" />
                        </Link>
                        <Link href="/" className={classes.link}>
                            <FormattedMessage id="CROSS_CHAIN" />
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
                        <Link href="/" className={classes.mobileLink}>
                            <FormattedMessage id="HOME" />
                        </Link>
                        <Link href="/exchange" className={classes.mobileLink}>
                            <FormattedMessage id="EXCHANGE" />
                        </Link>
                        <Link href="/app.symblox.io" className={classes.mobileLink}>
                            <FormattedMessage id="V1" />
                        </Link>
                        <Link href="/" className={classes.mobileLink}>
                            <FormattedMessage id="CROSS_CHAIN" />
                        </Link>
                    </div>
                </Drawer>
            </Hidden>
        </AppBar> 
    );
};
