import React, {useContext} from "react";
import "../../App.scss";
import "./header.scss";
import {Container, Hidden} from "@material-ui/core";
import logo_xswap from "../../assets/symblox-logo@2x.png";
import icon_user from "../../assets/icon_user.svg";
import {ethToVlx} from "../../utils/vlxAddressConversion.js";

// add i18n.
import {LanguageContext} from "../../contexts/LanguageContext";

import {LanguageSelector} from "../LanguageSelector";
import {WalletSelector} from "../WalletSelector";

export const Header = ({show, address, overlayClicked, linkTo}) => {
    return (
        <Container style={{paddingTop: "41px", paddingBottom: "45px"}}>
            <Hidden smUp>
                <a
                    href={linkTo}
                    className={"header__logo"}
                    style={{widht: "80px", height: "auto"}}
                >
                    <img
                        src={logo_xswap}
                        alt="logo"
                        style={{height: "22px", marginTop: "4px"}}
                    />
                </a>

                <div
                    className={"header__menu"}
                    style={{
                        maginTop: "3px",
                        float: "right"
                    }}
                >
                    <WalletSelector />
                    <LanguageSelector />
                </div>
            </Hidden>
            <Hidden xsDown>
                <a
                    href={linkTo}
                    className={"header__logo"}
                    style={{widht: "188px", height: "auto"}}
                >
                    <img src={logo_xswap} alt="logo" style={{height: "39px"}} />
                </a>

                <div
                    className={"header__menu"}
                    style={{
                        maginTop: "3px",
                        float: "right"
                    }}
                >
                    <WalletSelector />
                    <LanguageSelector />
                </div>
            </Hidden>
        </Container>
    );
};
