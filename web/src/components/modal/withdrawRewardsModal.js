import React, {Component} from "react";
import {FormattedMessage} from "react-intl";
import {withStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Dialog from "@material-ui/core/Dialog";
import Divider from "@material-ui/core/Divider";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import Store from "../../stores";
import {GET_REWARDS, WITHDRAW} from "../../constants";

const dispatcher = Store.dispatcher;

const styles = theme => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
        textAlign: "center"
    },
    button: {
        background:
            "linear-gradient(135deg, #FF3A33 0%, #FC06C6 100%, #FF3A33)",
        borderRadius: "26px",
        // fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: "20px",
        lineHeight: "34px",
        color: "#FFFFFF",
        height: "60px",
        margin: "16px 0px 32px 0px",
        "&:hover": {
            background:
                "linear-gradient(315deg, #FF3A33 0%, #FC06C6 100%, #FF3A33)"
        }
    },
    buttonSecondary: {
        background:
            "linear-gradient(135deg, #41587A 0%, #0B2243 93.26%, #41587A)",
        borderRadius: "26px",
        // fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: "20px",
        lineHeight: "34px",
        color: "#FFFFFF",
        height: "60px",
        margin: "16px 0px 32px 0px",
        "&:hover": {
            background:
                "linear-gradient(315deg, #41587A 0%, #0B2243 93.26%, #41587A)"
        }
    },
    containedButton: {
        borderRadius: "6px",
        margin: "0 6px"
    },
    select: {
        borderRadius: "6px"
    },
    closeButton: {
        position: "absolute",
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500]
    },
    formControl: {
        margin: 0,
        minWidth: 120
    },
    formContent: {
        margin: "16px 0px",
        display: "flex"
    },
    textField: {
        flex: 1
    },
    rightButton: {
        right: 0,
        position: "absolute"
    },
    message: {
        lineHeight: "44px"
    }
});

const DialogTitle = withStyles(styles)(props => {
    const {children, classes, onClose, ...other} = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton
                    aria-label="close"
                    className={classes.closeButton}
                    onClick={onClose}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

const DialogContent = withStyles(theme => ({
    root: {
        padding: theme.spacing(2)
    }
}))(MuiDialogContent);

const DialogActions = withStyles(theme => ({
    root: {
        margin: 0,
        padding: theme.spacing(1)
    }
}))(MuiDialogActions);

class WithdrawRewardsModal extends Component {
    constructor(props) {
        super(props);

        let curPool;
        props.data.forEach(data => {
            if (data.entryContractAddress) {
                curPool = data;
            }
        });
        this.state = {
            pool: curPool,
            token: curPool.tokens[0],
            amount: "0"
        };
    }

    handleChange = event => {
        const token = event.target.name;
        this.setState({
            [token]: event.target.value
        });
    };

    poolHandleChange = event => {
        this.setState({
            pool: this.props.data[event.target.value]
        });
    };

    amountChange = event => {
        this.setState({
            amount: event.target.value
        });
    };

    max = () => {
        const pool = this.state.pool;
        const token = this.state.token;
        const formatNumberPrecision = this.formatNumberPrecision;

        let maxAmount =
            pool.type == "seed"
                ? formatNumberPrecision(pool.stakeAmount)
                : token == "SYX"
                ? (parseFloat(pool.stakeAmount) * parseFloat(pool.BPTPrice)) /
                      parseFloat(pool.price) >
                  parseFloat(pool.maxSyxOut)
                    ? formatNumberPrecision(pool.maxSyxOut)
                    : formatNumberPrecision(
                          parseFloat(pool.stakeAmount) *
                              parseFloat(pool.BPTPrice)
                      ) / parseFloat(pool.price)
                : parseFloat(pool.stakeAmount) * parseFloat(pool.BPTPrice) >
                  parseFloat(pool.maxErc20Out)
                ? formatNumberPrecision(pool.maxErc20Out)
                : formatNumberPrecision(
                      parseFloat(pool.stakeAmount) * parseFloat(pool.BPTPrice)
                  );

        this.setState({
            amount: maxAmount + ""
        });
    };

    formatNumberPrecision = (data, decimals = 6) => {
        return Math.floor(parseFloat(data) * 10 ** decimals) / 10 ** decimals;
    };

    formatNumber = (amount, decimals, decimalPlace = decimals) => {
        let roundAmount = amount.replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
        let index = roundAmount.indexOf(".");
        return roundAmount.slice(0, index - 1 + decimalPlace);
    };

    confirm = () => {
        let amount;
        if (this.state.pool.type === "seed") {
            amount = this.formatNumber(
                parseFloat(this.state.amount).toString(),
                18,
                12
            );
            dispatcher.dispatch({
                type: WITHDRAW,
                content: {
                    asset: this.state.pool,
                    amount,
                    token: ""
                }
            });
        } else {
            if (this.state.token == "SYX") {
                amount = this.formatNumber(
                    (
                        (parseFloat(this.state.amount) *
                            parseFloat(this.state.pool.price)) /
                        parseFloat(this.state.pool.BPTPrice)
                    ).toString(),
                    18,
                    12
                );
            } else {
                amount = this.formatNumber(
                    (
                        parseFloat(this.state.amount) /
                        parseFloat(this.state.pool.BPTPrice)
                    ).toString(),
                    18,
                    12
                );
            }

            dispatcher.dispatch({
                type: WITHDRAW,
                content: {
                    asset: this.state.pool,
                    amount,
                    token:
                        this.state.token == "SYX"
                            ? this.state.pool.rewardsAddress
                            : this.state.pool.erc20Address
                }
            });
        }
    };

    onClaim = () => {
        dispatcher.dispatch({
            type: GET_REWARDS,
            content: {
                asset: this.state.pool
            }
        });
    };

    render() {
        const {classes, data, closeModal, modalOpen} = this.props;
        const {pool} = this.state;
        const fullScreen = window.innerWidth < 450;

        return (
            <Dialog
                onClose={closeModal}
                aria-labelledby="customized-dialog-title"
                open={modalOpen}
                fullWidth={true}
                fullScreen={fullScreen}
            >
                <DialogTitle id="customized-dialog-title" onClose={closeModal}>
                    <FormattedMessage id="RP_WITHDRAW_REWARDS" />
                </DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        <FormattedMessage id="WITHDRAWABLE_REWARDS" />
                        {": "}
                        {parseFloat(pool.rewardsAvailable).toFixed(4) + "SYX"}
                    </Typography>
                    <div className={classes.formContent}>
                        <span className={classes.message}>
                            <FormattedMessage id="RP_LIST_TITLE" />
                        </span>
                        <Select
                            className={classes.select}
                            value={pool.index}
                            onChange={this.poolHandleChange.bind(this)}
                            inputProps={{
                                name: "pool",
                                id: "outlined-token"
                            }}
                        >
                            {data.map(v => {
                                if (v.entryContractAddress) {
                                    return (
                                        <option value={v.index}>{v.id}</option>
                                    );
                                }
                            })}
                        </Select>
                    </div>
                    <Typography gutterBottom>
                        <FormattedMessage id="POPUP_WALLET_BALANCE" />
                        {pool.type == "seed"
                            ? parseFloat(pool.stakeAmount)
                            : this.state.token == "SYX"
                            ? (parseFloat(pool.stakeAmount) *
                                  parseFloat(pool.BPTPrice)) /
                                  parseFloat(pool.price) >
                              parseFloat(pool.maxSyxOut)
                                ? parseFloat(pool.maxSyxOut).toFixed(4)
                                : (
                                      (parseFloat(pool.stakeAmount) *
                                          parseFloat(pool.BPTPrice)) /
                                      parseFloat(pool.price)
                                  ).toFixed(4)
                            : parseFloat(pool.stakeAmount) *
                                  parseFloat(pool.BPTPrice) >
                              parseFloat(pool.maxErc20Out)
                            ? parseFloat(pool.maxErc20Out).toFixed(4)
                            : (
                                  parseFloat(pool.stakeAmount) *
                                  parseFloat(pool.BPTPrice)
                              ).toFixed(4)}
                        {this.state.token}
                    </Typography>
                    <div className={classes.formContent}>
                        <TextField
                            className={classes.textField}
                            value={this.state.amount}
                            onChange={this.amountChange}
                            id="outlined-basic"
                            label={<FormattedMessage id="POPUP_INPUT_AMOUNT" />}
                            variant="outlined"
                        />
                        <Button
                            className={classes.containedButton}
                            variant="contained"
                            onClick={this.max}
                        >
                            <FormattedMessage id="POPUP_INPUT_MAX" />
                        </Button>
                        <Select
                            className={classes.select}
                            value={this.state.token}
                            onChange={this.handleChange.bind(this)}
                            label="Token"
                            inputProps={{
                                name: "token",
                                id: "outlined-token"
                            }}
                        >
                            {pool.tokens.map(v => (
                                <option value={v}>{v}</option>
                            ))}
                        </Select>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Grid container>
                        <Grid item xs={6}>
                            <Button
                                className={classes.button}
                                autoFocus
                                onClick={this.onClaim}
                                fullWidth={true}
                            >
                                <FormattedMessage id="RP_WITHDRAW_REWARDS" />
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                className={classes.buttonSecondary}
                                autoFocus
                                onClick={this.confirm}
                                fullWidth={true}
                            >
                                <FormattedMessage id="LP_WITHDRAW" />
                            </Button>
                        </Grid>
                    </Grid>
                </DialogActions>
            </Dialog>
        );
    }
}

export default withStyles(styles)(WithdrawRewardsModal);
