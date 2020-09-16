import React from "react";
import "../../App.scss";
import "./header.scss";
import {Select, Container, Hidden} from "@material-ui/core";
import logo_xswap from "../../assets/symblox-logo@2x.png";
import icon_user from "../../assets/icon_user.svg";

// add i18n.
import {IntlProvider, FormattedMessage} from "react-intl";
import en_US from "../../language/en_US";
import zh_CN from "../../language/zh_CN";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <IntlProvider
                locale={"en"}
                messages={this.props.cur_language === "中文" ? zh_CN : en_US}
            >
                <Container style={{paddingTop: "41px", paddingBottom: "80px"}}>
                    <Hidden smUp>
                        <a
                            href={this.props.linkTo}
                            className={"header__logo"}
                            style={{widht: "94px", height: "auto"}}
                        >
                            <img
                                src={logo_xswap}
                                alt="logo"
                                style={{height: "20px"}}
                            />
                        </a>
                    </Hidden>
                    <Hidden xsDown>
                        <a
                            href={this.props.linkTo}
                            className={"header__logo"}
                            style={{widht: "188px", height: "auto"}}
                        >
                            <img
                                src={logo_xswap}
                                alt="logo"
                                style={{height: "39px"}}
                            />
                        </a>
                    </Hidden>

                    <div
                        className={"header__menu"}
                        style={{
                            height: "36px",
                            maginTop: "3px",
                            float: "right"
                        }}
                    >
                        {this.props.address && this.props.show && (
                            <a className={"header__menu_wallet"}>
                                <div
                                    onClick={() =>
                                        this.props.overlayClicked &&
                                        this.props.overlayClicked()
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
                                    {this.props.address}
                                </div>
                            </a>
                        )}
                        {!this.props.address && this.props.show && (
                            <a
                                className={"header__menu_wallet"}
                                onClick={() =>
                                    this.props.overlayClicked &&
                                    this.props.overlayClicked()
                                }
                            >
                                <FormattedMessage id="LABEL_CONNECT_WALLET" />
                            </a>
                        )}
                        <Select
                            className={"header__menu_wallet"}
                            value={this.props.cur_language}
                            onChange={this.props.setLanguage.bind(this)}
                            label="Lanage"
                            style={{width: "60px", paddingRight: 0}}
                            inputProps={{
                                name: "lanage",
                                id: "outlined-token"
                            }}
                        >
                            <option value={"中文"}>{"中文"}</option>
                            <option value={"EN"}>{"EN"}</option>
                        </Select>
                    </div>
                </Container>
            </IntlProvider>
        );
    }
}
