import React, {useContext} from "react";
import {FormattedMessage} from "react-intl";
import {Button, Popover, Grid, Typography} from "@material-ui/core";
import PopupState, {bindTrigger, bindPopover} from "material-ui-popup-state";

import {Web3Context} from "../contexts/Web3Context";
import {networkOptions} from "../constants/constants";
import {ethToVlx} from "../utils/vlxAddressConversion.js";

const formatAddress = (address, chainId) => {
    if (chainId == 106 || chainId == 111) {
        address = ethToVlx(address);
    }
    const len = address.length;
    return `${address.substr(0, 6)}...${address.substr(len - 4, len - 1)}`;
};
export const WalletSelector = props => {
    const {connectWeb3, disconnect, account, providerNetwork} = useContext(
        Web3Context
    );

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = event => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? "wallet-popover" : undefined;

    const getNetworkName = chainId => {
        let currNetwork = networkOptions.find(
            network => network.value == chainId
        );
        currNetwork = !currNetwork ? networkOptions[0] : currNetwork;
        return currNetwork["name"];
    };

    return (
        <div>
            {!account && (
                <div className={"header__menu_wallet"}>
                    <Button onClick={connectWeb3}>
                        <FormattedMessage id="LABEL_CONNECT_WALLET" />
                    </Button>
                </div>
            )}
            {account && (
                <PopupState variant="popover" popupId="wallet-button-popover">
                    {popupState => (
                        <div className={"header__menu_wallet"}>
                            <Button
                                aria-describedby={id}
                                {...bindTrigger(popupState)}
                            >
                                {formatAddress(
                                    account,
                                    providerNetwork.chainId
                                )}
                            </Button>
                            <Popover
                                {...bindPopover(popupState)}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "center"
                                }}
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "center"
                                }}
                            >
                                <Grid
                                    container
                                    direction="column"
                                    alignItems="center"
                                    style={{padding: "10px"}}
                                >
                                    <Grid item>
                                        <Typography
                                            gutterBottom
                                            variant="subtitle1"
                                        >
                                            <FormattedMessage
                                                id="WALLET_CONNECT_TO"
                                                values={{
                                                    network: getNetworkName(
                                                        providerNetwork.chainId
                                                    )
                                                }}
                                            />
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            style={{height: "2rem"}}
                                            onClick={disconnect}
                                        >
                                            <p>
                                                {" "}
                                                <FormattedMessage id="WALLET_DISCONNECT" />
                                            </p>
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Popover>
                        </div>
                    )}
                </PopupState>
            )}
        </div>
    );
};
