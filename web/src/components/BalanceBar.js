import React from "react";
import {FormattedMessage} from "react-intl";
import {withStyles} from "@material-ui/core/styles";
import Balance from "./balance";

const styles = theme => ({
     balanceBar: {
        textAlign: "left",
        color: "white",
        fontSize: "24px",
        "& div": {
            display: "flex"
        }
    },
    walletIcon: {
        width: "24px",
        height: "24px",
        marginRight: "8px"
    }
});

const BalanceBar = ({classes, balances}) => {
    return (
        <div className={classes.balanceBar}>
            <img
                className={classes.walletIcon}
                src={"/wallet.svg"}
                alt=""
            />
            <span style={{opacity: "0.6"}}>
                <FormattedMessage id="WALLET_BALANCE" />
            </span>
            <div
                style={{
                    display: "flex",
                    margin: "10px auto 20px",
                    overflowX: "scroll",
                    overflowY: "hidden"
                }}
            >
                {Array.from(balances).map((data, i) => (
                    <Balance
                        key={i}
                        outline={true}
                        name={data.name}
                        balance={data.balance}
                    />
                ))}
            </div>
        </div>
    );
};

export default withStyles(styles)(BalanceBar);
