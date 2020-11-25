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
import CircularProgress from "@material-ui/core/CircularProgress";
import {formatNumberPrecision} from "../../utils/numberFormat.js";
import NumberFormat from 'react-number-format';

import Store from "../../stores";
import {
    DEPOSIT,
    CALCULATE_AMOUNT,
    CALCULATE_AMOUNT_RETURNED
} from "../../constants";

import config from "../../config";

const dispatcher = Store.dispatcher;
const emitter = Store.emitter;

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
        const url = window.location.search;
        let theRequest = new Object();
        if ( url.indexOf( "?" ) !== -1 ){
            let str = url.substr( 1 ); 
            let strs = str.split( "&" );  
            for ( var i = 0; i < strs.length; i++ ) {  
                theRequest[ strs[ i ].split( "=" )[ 0 ] ] = ( strs[ i ].split( "=" )[ 1 ] );  
            }    
        }

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
                loading: false,
                amount: "0",
                referral: theRequest.referral,
                availableAmount: "0",
                availableAmountLoading: true
            };
        } else {
            this.state = {
                pool: props.data,
                token: props.data.tokens[props.data.tokens.length - 1],
                loading: false,
                amount: "0",
                referral: theRequest.referral,
                availableAmount: "0",
                availableAmountLoading: true
            };
        }

        this.calculateAmount();
    }

    handleChange = event => {
        const that = this;
        const token = event.target.name;
        this.setState(
            {
                [token]: event.target.value
            },
            () => {
                that.calculateAmount();
            }
        );
    };

    poolHandleChange = event => {
        const that = this;
        let selectPool;
        for(let i = 0;i<this.props.data.length;i++){
            if(this.props.data[i].index.toString() === event.target.value.toString()){
                selectPool = this.props.data[i];
                break;
            }
        }
        if(selectPool)
        this.setState(
            {
                pool: selectPool,
                token: selectPool.tokens[0]
            },
            () => {
                that.calculateAmount();
            }
        );
    };

    amountChange = event => {
        this.setState({
            amount: event.target.value
        });
    };

    referralChange = event => {
        this.setState({
            referral: event.target.value
        });
    };

    componentWillMount() {
        emitter.on(
            CALCULATE_AMOUNT_RETURNED,
            this.setAvailableAmount.bind(this)
        );
    }

    componentWillUnmount() {
        emitter.removeListener(
            CALCULATE_AMOUNT_RETURNED,
            this.setAvailableAmount.bind(this)
        );
    }

    setAvailableAmount(data) {
        this.setState({
            availableAmount: data,
            availableAmountLoading: false
        });
    }

    calculateAmount = () => {
        this.setState({
            availableAmountLoading: true
        });
        dispatcher.dispatch({
            type: CALCULATE_AMOUNT,
            content: {
                asset: this.state.pool,
                amount: this.state.pool.stakeAmount,
                token:
                    this.state.token === "SYX"
                        ? this.state.pool.rewardsAddress
                        : this.state.pool.erc20Address
            }
        });
    };

    getMaxAmount = () => {
        const pool = this.state.pool;
        const token = this.state.token;

        let balance = parseFloat(pool.erc20Balance);
        if (pool.type === "seed" || pool.type === "swap-native") {
            balance =
                balance > config.minReservedAmount
                    ? balance - config.minReservedAmount
                    : 0;
        }

        switch (pool.type) {
            case "seed":
                return formatNumberPrecision(balance);
            case "swap":
            case "swap-native":
                if (token === "SYX") {
                    if (
                        parseFloat(pool.maxSyxIn) >
                        parseFloat(pool.rewardsBalance)
                    ) {
                        return formatNumberPrecision(pool.rewardsBalance);
                    } else {
                        return formatNumberPrecision(pool.maxSyxIn);
                    }
                } else {
                    if (parseFloat(pool.maxErc20In) > balance) {
                        return formatNumberPrecision(balance);
                    } else {
                        return formatNumberPrecision(pool.maxErc20In);
                    }
                }
            default:
                return 0;
        }
    };

    max = () => {
        this.setState({
            amount: this.getMaxAmount() + ""
        });
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
            type: DEPOSIT,
            content: {
                asset: this.state.pool,
                amount: parseFloat(this.state.amount).toString(),
                referral: this.state.referral,
                token:
                    this.state.pool.type === "seed"
                        ? ""
                        : this.state.token === "SYX"
                        ? this.state.pool.rewardsAddress
                        : this.state.pool.erc20Address
            }
        });
    };

    render() {
        const {classes, data, closeModal, modalOpen} = this.props;
        const {pool, loading, token, amount, referral} = this.state;
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
                                {data.map((v, i) => {
                                    if (v.entryContractAddress) {
                                        return (
                                            <MenuItem value={v.index} key={i}>
                                                {v.id}
                                            </MenuItem>
                                        );
                                    } else {
                                        return <></>;
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
                    {this.state.pool.referral?(
                    <>
                        <Typography gutterBottom style={{overflow: "scroll"}}>
                            <span style={{color: "#ACAEBC"}}>
                                <FormattedMessage id="REFERRER" />
                                {": "}
                            </span>
                        </Typography>
                        <div className={classes.formContent}>
                            <FormControl variant="outlined" style={{flex: "1"}}>
                                <OutlinedInput
                                    className={classes.customInput}
                                    id="outlined-adornment-password"
                                    type={"text"}
                                    value={referral}
                                    onChange={this.referralChange}   
                                />
                            </FormControl>
                        </div>
                    </>
                    ):<></>}
                    <Typography gutterBottom style={{overflow: "scroll"}}>
                        <span style={{color: "#ACAEBC"}}>
                            <FormattedMessage id="TOTAL_STAKE" />
                            {": "}
                        </span>
                        <span className={classes.rightText}>
                            {pool.type === "seed" ? (
                                <NumberFormat value={pool.stakeAmount} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} decimalScale={4} fixedDecimalScale={true} />
                            ) : this.state.availableAmountLoading ? (
                                <CircularProgress
                                    style={{
                                        width: "24px",
                                        height: "24px"
                                    }}
                                ></CircularProgress>
                            ) : (
                                <NumberFormat value={this.state.availableAmount} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} decimalScale={4} fixedDecimalScale={true} />
                            )}
                            {" " + this.state.token}
                        </span>
                    </Typography>
                    <Typography gutterBottom style={{overflow: "scroll"}}>
                        <span style={{color: "#ACAEBC"}}>
                            <FormattedMessage id="POPUP_DEPOSITABLE_AMOUNT" />
                            {": "}
                        </span>
                        <NumberFormat value={this.getMaxAmount()} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} suffix={pool.type === "seed"?pool.symbol:(token === "SYX"?"SYX":pool.name)} decimalScale={4} fixedDecimalScale={true} renderText={value => <span className={classes.rightText}>{value}</span>}/>
                    </Typography>
                    <div className={classes.formContent}>
                        <FormControl variant="outlined" style={{flex: "4"}}>
                            <OutlinedInput
                                className={classes.customInput}
                                error={
                                    parseFloat(amount) >
                                    parseFloat(this.getMaxAmount())
                                }
                                id="outlined-adornment-password"
                                type={"text"}
                                value={amount}
                                onChange={this.amountChange}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <Button
                                            className={classes.maxBtn}
                                            style={{
                                                opacity:
                                                    parseFloat(amount).toFixed(
                                                        4
                                                    ) ===
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
                            {parseFloat(amount) >
                            parseFloat(this.getMaxAmount()) ? (
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
                                value={token}
                                onChange={this.handleChange.bind(this)}
                                inputProps={{
                                    name: "token",
                                    id: "outlined-token"
                                }}
                            >
                                {pool.tokens.map((v, i) => (
                                    <MenuItem value={v} key={i}>
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
                            <FormattedMessage id="POPUP_WITHDRAW_REWARD" />
                        </span>
                        <NumberFormat value={pool.rewardsAvailable} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} suffix={"SYX"} decimalScale={4} fixedDecimalScale={true} renderText={value => <span className={classes.rightText}>{value}</span>}/>
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
                            <FormattedMessage id="LP_DEPOSIT_WITHDRAW_REWARD" />
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default withStyles(styles)(DepositModal);
