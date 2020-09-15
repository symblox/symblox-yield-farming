import React, {Component} from "react";
import {FormattedMessage} from "react-intl";
import {withStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import Store from "../../stores";
import {DEPOSIT} from "../../constants";

const dispatcher = Store.dispatcher;

const styles = theme => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
        fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: "28px",
        lineHeight: "39px",
        textAlign: "center",
        color: "#1E304B"
    },
    button: {
        background:
            "linear-gradient(135deg, #42D9FE 0%, #2872FA 100%, #42D9FE)",
        borderRadius: "26px",
        fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: "24px",
        lineHeight: "34px",
        color: "#FFFFFF",
        paddingTop: "9px",
        minWidth: "115px",
        margin: "16px 8px 32px 8px",
        "&:hover": {
            background:
                "linear-gradient(315deg, #4DB5FF 0%, #57E2FF 100%, #4DB5FF)"
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
    message: {
        paddingTop: "12px"
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

class DepositModal extends Component {
    constructor(props) {
        super(props);

        if (Array.isArray(props.data)) {
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
        } else {
            this.state = {
                pool: props.data,
                token: props.data.tokens[0],
                amount: "0"
            };
        }
    }

    handleChange = event => {
        const token = event.target.name;
        this.setState({
            [token]: event.target.value
        });
    };

    poolHandleChange = event => {
        this.setState({
            pool: this.props.data[event.target.value],
            token: this.props.data[event.target.value].tokens[0]
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
                ? formatNumberPrecision(pool.erc20Balance)
                : token == "SYX"
                ? parseFloat(pool.maxSyxIn) > parseFloat(pool.rewardsBalance)
                    ? formatNumberPrecision(pool.rewardsBalance)
                    : formatNumberPrecision(pool.maxSyxIn)
                : parseFloat(pool.maxErc20In) > parseFloat(pool.erc20Balance)
                ? formatNumberPrecision(pool.erc20Balance)
                : formatNumberPrecision(pool.maxErc20In);
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
        dispatcher.dispatch({
            type: DEPOSIT,
            content: {
                asset: this.state.pool,
                amount: this.formatNumber(this.state.amount, 18, 6),
                token:
                    this.state.pool.type == "seed"
                        ? ""
                        : this.state.token == "SYX"
                        ? this.state.pool.rewardsAddress
                        : this.state.pool.erc20Address
            }
        });

        this.props.closeModal();
    };

    render() {
        const {classes, data, closeModal, modalOpen} = this.props;
        const {pool, token, amount} = this.state;
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
                    <FormattedMessage id="POPUP_TITLE_DEPOSIT" />
                </DialogTitle>
                <DialogContent>
                    {Array.isArray(data) ? (
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
                                            <option value={v.index}>
                                                {v.id}
                                            </option>
                                        );
                                    }
                                })}
                            </Select>
                        </div>
                    ) : (
                        <></>
                    )}
                    <Typography gutterBottom>
                        <FormattedMessage id="POPUP_WALLET_BALANCE" />
                        {": "}
                        {pool.type == "seed"
                            ? parseFloat(pool.erc20Balance).toFixed(4) +
                              pool.symbol
                            : token == "SYX"
                            ? parseFloat(pool.maxSyxIn) >
                              parseFloat(pool.rewardsBalance)
                                ? parseFloat(pool.rewardsBalance).toFixed(4)
                                : parseFloat(pool.maxSyxIn).toFixed(4) + "SYX"
                            : parseFloat(pool.maxErc20In) >
                              parseFloat(pool.erc20Balance)
                            ? parseFloat(pool.erc20Balance).toFixed(4)
                            : parseFloat(pool.maxErc20In).toFixed(4) +
                              pool.name}
                    </Typography>
                    <div className={classes.formContent}>
                        <TextField
                            className={classes.textField}
                            value={amount}
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
                        <FormControl
                            variant="outlined"
                            className={classes.formControl}
                        >
                            <InputLabel htmlFor="age-native-simple">
                                <FormattedMessage id="POPUP_INPUT_TOKEN" />
                            </InputLabel>
                            <Select
                                className={classes.select}
                                value={token}
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
                        </FormControl>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        autoFocus
                        onClick={this.confirm}
                        className={classes.button}
                        fullWidth={true}
                    >
                        <FormattedMessage id="LP_DEPOSIT" />
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default withStyles(styles)(DepositModal);
