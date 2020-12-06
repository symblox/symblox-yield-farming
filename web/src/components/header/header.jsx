import React, {useContext} from "react";
import "../../App.scss";
import "./header.scss";
import {Select, Container, Hidden, MenuItem} from "@material-ui/core";
import logo_xswap from "../../assets/symblox-logo@2x.png";
import icon_user from "../../assets/icon_user.svg";
import {ethToVlx} from "../../utils/vlxAddressConversion.js";

// add i18n.
import {LanguageContext} from "../../contexts/LanguageContext";
import {FormattedMessage} from "react-intl";

import {LanguageSelector} from "../LanguageSelector";

export const Header = ({show, address, overlayClicked, linkTo}) => {
    const {language, setLanguage} = useContext(LanguageContext);
    const onChange = data => {
        // close();
        setLanguage(data);
    };

    const formatAddress = address => {
        address = ethToVlx(address);
        if (address) {
            return (
                address.substring(0, 6) +
                "..." +
                address.substring(address.length - 4, address.length)
            );
        }
    };

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
                    {address && show && (
                        <div className={"header__menu_wallet_sm"}>
                            <div
                                onClick={() =>
                                    overlayClicked && overlayClicked()
                                }
                            >
                                {/* <img
                                            src={icon_user}
                                            alt=""
                                            style={{
                                                width: "16px",
                                                height: "16px",
                                                marginRight: "5px"
                                            }}
                                        /> */}
                                {formatAddress(address)}
                            </div>
                        </div>
                    )}
                    {!address && show && (
                        <div
                            className={"header__menu_wallet_sm"}
                            onClick={() => overlayClicked && overlayClicked()}
                        >
                            <FormattedMessage id="LABEL_CONNECT_WALLET" />
                        </div>
                    )}
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
                    {address && show && (
                        <div className={"header__menu_wallet"}>
                            <div
                                onClick={() =>
                                    overlayClicked && overlayClicked()
                                }
                            >
                                <img
                                    src={icon_user}
                                    alt=""
                                    style={{
                                        width: "16px",
                                        height: "16px",
                                        marginRight: "5px"
                                    }}
                                />
                                {formatAddress(address)}
                            </div>
                        </div>
                    )}
                    {!address && show && (
                        <div
                            className={"header__menu_wallet"}
                            onClick={() => overlayClicked && overlayClicked()}
                        >
                            <FormattedMessage id="LABEL_CONNECT_WALLET" />
                        </div>
                    )}
                    <LanguageSelector />
                </div>
            </Hidden>
        </Container>
    );
};
