import React, {Component} from "react";
import {FormattedMessage} from "react-intl";
import {withStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import InputAdornment from "@material-ui/core/InputAdornment";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";

import Store from "../../stores";
import {DEPOSIT} from "../../constants";

const dispatcher = Store.dispatcher;

const styles = theme => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
        // fontFamily: "Noto Sans SC",
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
        // fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: "20px",
        lineHeight: "34px",
        color: "#FFFFFF",
        paddingTop: "9px",
        height: "50px",
        minWidth: "115px",
        margin: "16px 8px 32px 8px",
        "&:hover": {
            background:
                "linear-gradient(315deg, #4DB5FF 0%, #57E2FF 100%, #4DB5FF)"
        },
        "&.Mui-disabled": {
            background:
                "linear-gradient(135deg, rgb(66, 217, 254, 0.12) 0%, rgb(40, 114, 250,0.12) 100%, rgb(66, 217, 254, 0.12))",
            color: "#FFFFFF"
        }
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
    icon: {
        width: "24px",
        height: "24px",
        display: "inline-block",
        margin: "auto 6px",
        verticalAlign: "middle"
    },
    customSelect: {
        width: "100%",
        height: "48px",
        lineHeight: "48px",
        border: "1px solid #EAEAEA",
        borderRadius: "6px",
        padding: "0px 20px",
        position: "relative",
        marginBottom: "20px",

        "& .MuiInput-root": {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0
        }
    },
    customInput: {
        border: "1px solid #EAEAEA",
        borderRadius: "6px",
        paddingRight: "0px",
        marginRight: "5px",

        "& button": {
            borderRadius: "0px",
            margin: "0",
            fontSize: "20px",
            lineHeight: "23px",
            color: "#ACAEBC"
        }
    },
    text: {
        fontStyle: "normal",
        fontWeight: "300",
        fontSize: "16px",
        lineHeight: "25px",
        color: "#ACAEBC"
    },
    rightText: {
        float: "right",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: "16px",
        lineHeight: "22px",
        textAlign: "right",
        color: "#4E5B70"
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
        // padding: theme.spacing(2)
    }
}))(MuiDialogContent);

const DialogActions = withStyles(theme => ({
    root: {
        margin: 0
        // padding: theme.spacing(1)
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
                token: curPool.tokens[curPool.tokens.length - 1],
                amount: "0"
            };
        } else {
            this.state = {
                pool: props.data,
                token: props.data.tokens[props.data.tokens.length - 1],
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
        if (
            parseFloat(this.state.amount) === 0 ||
            isNaN(parseFloat(this.state.amount))
        )
            return;
        this.props.showLoading();
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

        // this.props.closeModal();
    };

    render() {
        const {classes, data, loading, closeModal, modalOpen} = this.props;
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
                        <div className={classes.customSelect}>
                            <FormattedMessage id="RP_LIST_TITLE" />:
                            <img
                                className={classes.icon}
                                src={"/" + this.state.pool.name + ".png"}
                                alt=""
                            />
                            {this.state.pool.id}
                            <Select
                                value={pool.index}
                                onChange={this.poolHandleChange.bind(this)}
                            >
                                {data.map(v => {
                                    if (v.entryContractAddress) {
                                        return (
                                            <MenuItem value={v.index}>
                                                {v.id}
                                            </MenuItem>
                                        );
                                    }
                                })}
                            </Select>
                            <img
                                className={classes.icon}
                                style={{
                                    float: "right",
                                    marginTop: "12px",
                                    width: "12px"
                                }}
                                src={"/down.svg"}
                                alt=""
                            />
                        </div>
                    ) : (
                        <></>
                    )}
                    <Typography gutterBottom>
                        <span style={{color: "#ACAEBC"}}>
                            <FormattedMessage id="POPUP_DEPOSITABLE_AMOUNT" />
                            {": "}
                        </span>
                        <span style={{float: "right"}}>
                            {pool.type == "seed"
                                ? parseFloat(pool.erc20Balance).toFixed(4) +
                                  pool.symbol
                                : token == "SYX"
                                ? parseFloat(pool.maxSyxIn) >
                                  parseFloat(pool.rewardsBalance)
                                    ? parseFloat(pool.rewardsBalance).toFixed(4)
                                    : parseFloat(pool.maxSyxIn).toFixed(4) +
                                      " SYX"
                                : parseFloat(pool.maxErc20In) >
                                  parseFloat(pool.erc20Balance)
                                ? parseFloat(pool.erc20Balance).toFixed(4)
                                : parseFloat(pool.maxErc20In).toFixed(4) +
                                  " " +
                                  pool.name}
                        </span>
                    </Typography>
                    <div className={classes.formContent}>
                        <FormControl variant="outlined" style={{flex: "4"}}>
                            <OutlinedInput
                                className={classes.customInput}
                                id="outlined-adornment-password"
                                type={"text"}
                                value={amount}
                                onChange={this.amountChange}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <Button
                                            disabled={loading}
                                            variant="outline"
                                            onClick={this.max}
                                        >
                                            <FormattedMessage id="POPUP_INPUT_MAX" />
                                        </Button>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                        <FormControl
                            variant="outlined"
                            className={classes.formControl}
                            style={{flex: "1"}}
                        >
                            <Select
                                className={classes.select}
                                value={token}
                                onChange={this.handleChange.bind(this)}
                                inputProps={{
                                    name: "token",
                                    id: "outlined-token"
                                }}
                            >
                                {pool.tokens.map(v => (
                                    <MenuItem value={v}>
                                        <img
                                            className={classes.icon}
                                            src={"/" + v + ".png"}
                                            alt=""
                                        />
                                        {v}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <Typography gutterBottom>
                        <span className={classes.text}>
                            <FormattedMessage id="TOTAL_STAKE_AFTER_DEPOSIT" />
                            {": "}
                        </span>
                        <span className={classes.rightText}>
                            {pool.type == "seed"
                                ? (
                                      parseFloat(pool.stakeAmount) +
                                      parseFloat(this.state.amount || 0)
                                  ).toFixed(4) + pool.symbol
                                : token == "SYX"
                                ? (
                                      (parseFloat(pool.stakeAmount) *
                                          parseFloat(pool.BPTPrice)) /
                                          parseFloat(pool.price) +
                                      parseFloat(this.state.amount || 0)
                                  ).toFixed(4) + " SYX"
                                : (
                                      parseFloat(pool.stakeAmount) *
                                          parseFloat(pool.BPTPrice) +
                                      parseFloat(this.state.amount || 0)
                                  ).toFixed(4) +
                                  " " +
                                  pool.name}
                        </span>
                    </Typography>
                    <Typography gutterBottom>
                        <span className={classes.text}>
                            <FormattedMessage id="POPUP_WITHDRAW_REWARD" />
                        </span>
                        <span className={classes.rightText}>
                            {parseFloat(pool.rewardsAvailable).toFixed(4)} SYX
                        </span>
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        autoFocus
                        disabled={loading}
                        onClick={this.confirm}
                        className={classes.button}
                        fullWidth={true}
                    >
                        <FormattedMessage id="LP_DEPOSIT_WITHDRAW_REWARD" />
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default withStyles(styles)(DepositModal);
