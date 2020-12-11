import React, {Component} from "react";
import {FormattedMessage} from "react-intl";
import {withStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Dialog from "@material-ui/core/Dialog";
import InputAdornment from "@material-ui/core/InputAdornment";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import MenuItem from "@material-ui/core/MenuItem";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import NumberFormat from 'react-number-format';
import {debounce} from "../../utils/debounce.js";
import {formatNumberPrecision} from "../../utils/numberFormat.js";

import config, {tokensName} from "../../config";

import Store from "../../stores";
import {
    TRADE,
    CALCULATE_PRICE,
    CALCULATE_PRICE_RETURNED
} from "../../constants";

const emitter = Store.emitter;
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
        minWidth: "115px",
        height: "50px",
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
    text: {
        // fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: "300",
        fontSize: "16px",
        lineHeight: "25px",
        color: "#ACAEBC"
    },
    rightText: {
        float: "right",
        // fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: "16px",
        lineHeight: "22px",
        textAlign: "right",
        color: "#4E5B70"
    },
    textPrimy: {
        fontWeight: 500,
        color: "#4E5B70"
    },
    icon: {
        width: "24px",
        height: "24px",
        display: "inline-block",
        margin: "auto 6px",
        verticalAlign: "middle"
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
    maxBtn: {
        padding: "10px 18px"
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
        padding: theme.spacing(2),
        // fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: "300",
        fontSize: "18px",
        lineHeight: "25px",
        color: "#ACAEBC"
    }
}))(MuiDialogContent);

const DialogActions = withStyles(theme => ({
    root: {
        margin: 0,
        padding: theme.spacing(1)
    }
}))(MuiDialogActions);

class TransactionModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tokens: props.data.tokens,
            token: props.data.tokens[0],
            amount: "0",
            price: props.data.price,
            buyToken: props.data.tokens[1],
            buyAmount: "0",
            loading: false
        };
    }

    componentWillMount() {
        emitter.on(CALCULATE_PRICE_RETURNED, this.setPrice.bind(this));
    }

    componentWillUnmount() {
        emitter.removeListener(
            CALCULATE_PRICE_RETURNED,
            this.setPrice.bind(this)
        );
    }

    setPrice(data) {
        this.setState({
            price: data.price.tradePrice,
            finallPrice: data.price.finallPrice,
            loading: false,
            last: null
        });
        const price = parseFloat(data.price.tradePrice);
        if (data.type === "sell") {
            this.setState({
                buyAmount: (parseFloat(data.amount) * price).toFixed(4)
            });
        } else if (data.type === "buyIn") {
            this.setState({
                amount: ((parseFloat(data.amount) * 1) / price).toFixed(4)
            });
        }
    }

    getPrice = (type, amount) => {
        if (type) {
            this.setState({loading: true});
            const that = this;
            debounce(
                1000,
                () => {
                    dispatcher.dispatch({
                        type: CALCULATE_PRICE,
                        content: {
                            asset: that.props.data,
                            amount,
                            type,
                            tokenName: that.state.token,
                            tokenIn:
                                that.state.token === that.props.data.tokens[1]
                                    ? that.props.data.erc20Address
                                    : that.props.data.erc20Address2,
                            tokenOut:
                                that.state.buyToken === that.props.data.tokens[1]
                                    ? that.props.data.erc20Address
                                    : that.props.data.erc20Address2
                        }
                    });
                },
                that
            )();
        } else {
            this.setState({
                price:
                    this.state.token === this.props.data.tokens[0]
                        ? this.props.data.price
                        : 1 / this.props.data.price
            });
        }
    };

    handleChange = event => {
        const token = event.target.name;
        this.setState({
            [token]: event.target.value,
            buyToken:
                this.state.tokens[0] === event.target.value
                    ? this.state.tokens[this.state.tokens.length - 1]
                    : this.state.tokens[0],
            amount: 0.0,
            buyAmount: 0.0,
            price: 1 / this.state.price
        });
    };

    buyHandleChange = event => {
        const token = event.target.name;
        this.setState({
            [token]: event.target.value,
            token:
                this.state.tokens[0] === event.target.value
                    ? this.state.tokens[this.state.tokens.length - 1]
                    : this.state.tokens[0],
            amount: 0.0,
            buyAmount: 0.0,
            price: 1 / this.state.price
        });
    };

    amountChange = event => {
        if (parseFloat(event.target.value) > 0) {
            this.setState({
                amount: event.target.value
            });
            this.getPrice("sell", parseFloat(event.target.value));
        } else {
            this.setState({
                amount: event.target.value,
                buyAmount: isNaN(
                    parseFloat(event.target.value) *
                        parseFloat(this.props.data.price)
                )
                    ? 0.0
                    : parseFloat(event.target.value) *
                      parseFloat(this.props.data.price).toFixed(4)
            });
            this.getPrice();
        }
    };

    buyAmountChange = event => {
        if (parseFloat(event.target.value) > 0) {
            this.setState({
                buyAmount: event.target.value
            });
            this.getPrice("buyIn", parseFloat(event.target.value));
        } else {
            this.setState({
                amount: isNaN(
                    (parseFloat(event.target.value) * 1) /
                        parseFloat(this.props.data.price)
                )
                    ? 0.0
                    : (
                          (parseFloat(event.target.value) * 1) /
                          parseFloat(this.props.data.price)
                      ).toFixed(4),
                buyAmount: event.target.value
            });
            this.getPrice();
        }
    };

    getMaxAmount = () => {
        const pool = this.props.data;
        const token = this.state.token;

        let erc20Balance;
        if(pool.type==="swap-native" && pool.erc20Balance>config.minReservedAmount){
            erc20Balance = parseFloat(pool.erc20Balance)-config.minReservedAmount;
        }else{
            erc20Balance = pool.erc20Balance;
        }

        return token === pool.tokens[0]
            ? parseFloat(pool.maxSyxIn) > parseFloat(pool.erc20Balance2)
                ? formatNumberPrecision(pool.erc20Balance2)
                : formatNumberPrecision(pool.maxSyxIn)
            : parseFloat(pool.maxErc20In) > erc20Balance
            ? formatNumberPrecision(erc20Balance+'')
            : formatNumberPrecision(pool.maxErc20In);
    };

    max = () => {
        const maxAmount = this.getMaxAmount();

        if (parseFloat(maxAmount) > 0) {
            this.setState({
                amount: maxAmount + ""
            });
            this.getPrice("sell", maxAmount);
        } else {
            this.setState({
                amount: maxAmount + "",
                buyAmount: (maxAmount * this.props.data.price).toFixed(6)
            });

            this.getPrice();
        }
    };

    confirm = () => {
        if (
            parseFloat(this.state.amount) === 0 ||
            isNaN(parseFloat(this.state.amount))
        )
            return;
            
        this.setState({
            loading: true
        });

        dispatcher.dispatch({
            type: TRADE,
            content: {
                asset: this.props.data,
                amount: parseFloat(this.state.amount).toString(),
                price: (parseFloat(this.state.finallPrice)*1.1).toString(),
                token:
                    this.state.token === this.props.data.tokens[0]
                        ? this.props.data.erc20Address2
                        : this.props.data.erc20Address,
                token2:
                    this.state.buyToken === this.props.data.tokens[0]
                        ? this.props.data.erc20Address2
                        : this.props.data.erc20Address
            }
        });
    };

    render() {
        const {classes, data, closeModal, modalOpen} = this.props;
        const {loading} = this.state;
        const fullScreen = window.innerWidth < 450;

        const availableAmount = parseFloat(
            this.state.token === data.tokens[0]
                ? parseFloat(data.maxSyxIn) > parseFloat(data.erc20Balance2)
                    ? parseFloat(data.erc20Balance2)
                    : parseFloat(data.maxSyxIn)
                : parseFloat(data.maxErc20In) > parseFloat(data.erc20Balance)
                ? parseFloat(data.erc20Balance)
                : parseFloat(data.maxErc20In)
        );

        return (
            <Dialog
                onClose={closeModal}
                aria-labelledby="customized-dialog-title"
                open={modalOpen}
                fullWidth={true}
                fullScreen={fullScreen}
            >
                <DialogTitle id="customized-dialog-title" onClose={closeModal}>
                    <FormattedMessage id="POPUP_TITLE_SWAP" />
                </DialogTitle>
                <DialogContent>
                    <Typography gutterBottom align="right">
                        <span style={{float: "left"}}>
                            <FormattedMessage id="POPUP_LABEL_FROM" />
                        </span>
                        <span className={classes.textPrimy}>
                            {this.state.token === "SYX" ? (
                                <img
                                    className={classes.icon}
                                    src={"/SYX.png"}
                                    alt=""
                                />
                            ) : (
                                <img
                                    className={classes.icon}
                                    src={"/" + data.name + ".png"}
                                    alt=""
                                />
                            )}
                            <FormattedMessage id="POPUP_TRADEABLE_AMOUNT" />
                            {": "}
                            {this.state.token === data.tokens[0]
                                ? parseFloat(data.maxSyxIn) >
                                  parseFloat(data.erc20Balance2)
                                    ? <NumberFormat value={data.erc20Balance2} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} suffix={tokensName[data.tokens[0].toLowerCase()]} decimalScale={4} fixedDecimalScale={true} />
                                    : <NumberFormat value={data.maxSyxIn} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} suffix={tokensName[data.tokens[0].toLowerCase()]} decimalScale={4} fixedDecimalScale={true} />
                                : parseFloat(data.maxErc20In) >
                                  parseFloat(data.erc20Balance)
                                ? <NumberFormat value={data.erc20Balance} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} suffix={tokensName[data.tokens[1].toLowerCase]} decimalScale={4} fixedDecimalScale={true} />
                                : <NumberFormat value={data.maxErc20In} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} suffix={tokensName[data.tokens[1].toLowerCase()]} decimalScale={4} fixedDecimalScale={true} />
                                  }
                        </span>
                    </Typography>
                    <div className={classes.formContent}>
                        <FormControl variant="outlined" style={{flex: "4"}}>
                            <OutlinedInput
                                error={
                                    parseFloat(this.state.amount) >
                                    availableAmount
                                }
                                className={classes.customInput}
                                id="outlined-adornment-password"
                                type={"text"}
                                value={this.state.amount}
                                onChange={this.amountChange}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <Button
                                            className={classes.maxBtn}
                                            style={{
                                                opacity:
                                                    parseFloat(
                                                        this.state.amount
                                                    ).toFixed(4) ===
                                                    this.getMaxAmount().toFixed(
                                                        4
                                                    )
                                                        ? "0.6"
                                                        : "1"
                                            }}
                                            disabled={loading}
                                            onClick={this.max}
                                        >
                                            <FormattedMessage id="POPUP_INPUT_MAX" />
                                        </Button>
                                    </InputAdornment>
                                }
                            />
                            {parseFloat(this.state.amount) > availableAmount ? (
                                <span style={{color: "red"}}>
                                    <FormattedMessage id="TRADE_ERROR_BALANCE" />
                                </span>
                            ) : (
                                <></>
                            )}
                        </FormControl>
                        <FormControl
                            variant="outlined"
                            className={classes.formControl}
                            style={{flex: "1"}}
                        >
                            <Select
                                className={classes.select}
                                value={this.state.token}
                                onChange={this.handleChange.bind(this)}
                                inputProps={{
                                    name: "token",
                                    id: "outlined-token"
                                }}
                            >
                                {data.tokens.map((v, i) => (
                                    <MenuItem value={v} key={i}>
                                        <img
                                            className={classes.icon}
                                            src={"/" + v + ".png"}
                                            alt=""
                                        />
                                        {tokensName[v.toLowerCase()]}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div style={{textAlign: "center", marginBottom: "16px"}}>
                        <img
                            className={classes.icon}
                            style={{
                                width: "20px"
                            }}
                            src={"/down2.svg"}
                            alt=""
                        />
                    </div>
                    <Typography gutterBottom align="right">
                        <span style={{float: "left"}}>
                            <FormattedMessage id="POPUP_LABEL_TO" />
                        </span>{" "}
                        <span className={classes.textPrimy}>
                            {this.state.buyToken === "SYX" ? (
                                <img
                                    className={classes.icon}
                                    src={"/SYX.png"}
                                    alt=""
                                />
                            ) : (
                                <img
                                    className={classes.icon}
                                    src={"/" + data.name + ".png"}
                                    alt=""
                                />
                            )}
                            <FormattedMessage id="POPUP_TRADEABLE_AMOUNT" />
                            {": "}
                            {this.state.token === data.tokens[1]
                                ? parseFloat(data.maxSyxIn) >
                                  parseFloat(data.erc20Balance2)
                                    ? <NumberFormat value={data.erc20Balance2} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} suffix={tokensName[data.tokens[0].toLowerCase()]} decimalScale={4} fixedDecimalScale={true} />
                                    : <NumberFormat value={data.maxSyxIn} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} suffix={tokensName[data.tokens[0].toLowerCase()]} decimalScale={4} fixedDecimalScale={true} />
                                : parseFloat(data.maxErc20In) >
                                  parseFloat(data.erc20Balance)
                                ? <NumberFormat value={data.erc20Balance} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} suffix={tokensName[data.tokens[1].toLowerCase()]} decimalScale={4} fixedDecimalScale={true} />
                                : <NumberFormat value={data.maxErc20In} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} suffix={tokensName[data.tokens[1].toLowerCase()]} decimalScale={4} fixedDecimalScale={true} />}
                        </span>
                    </Typography>
                    <div className={classes.formContent}>
                        <FormControl variant="outlined" style={{flex: "4"}}>
                            <OutlinedInput
                                className={classes.customInput}
                                id="outlined-adornment-password"
                                type={"text"}
                                value={this.state.buyAmount}
                                onChange={this.buyAmountChange}
                            />
                        </FormControl>
                        <FormControl
                            variant="outlined"
                            className={classes.formControl}
                            style={{flex: "1"}}
                        >
                            <Select
                                className={classes.select}
                                value={this.state.buyToken}
                                onChange={this.buyHandleChange.bind(this)}
                                inputProps={{
                                    name: "buyToken",
                                    id: "outlined-token"
                                }}
                            >
                                {data.tokens.map((v, i) => (
                                    <MenuItem value={v} key={i}>
                                        <img
                                            className={classes.icon}
                                            src={"/" + v + ".png"}
                                            alt=""
                                        />
                                        {tokensName[v.toLowerCase()]}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <Typography gutterBottom>
                        <span className={classes.text}>
                            <FormattedMessage id="UNIT_PRICE" />
                        </span>
                        <span className={classes.rightText}>
                            <FormattedMessage
                                id="POPUP_LABEL_SWAP_RATE"
                                values={{
                                    tokenFrom: tokensName[this.state.token.toLowerCase()],
                                    tokenTo: tokensName[this.state.buyToken.toLowerCase()],
                                    rate: parseFloat(this.state.price).toFixed(
                                        4
                                    )
                                }}
                            />
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
                        {loading ? (
                            <CircularProgress></CircularProgress>
                        ) : (
                            <FormattedMessage id="POPUP_ACTION_CONFIRM" />
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default withStyles(styles)(TransactionModal);
