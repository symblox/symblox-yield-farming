import React, {Component} from "react";
import {FormattedMessage} from "react-intl";
import {withStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Dialog from "@material-ui/core/Dialog";
import InputAdornment from "@material-ui/core/InputAdornment";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import MenuItem from "@material-ui/core/MenuItem";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import NumberFormat from 'react-number-format';
import {debounce} from "../../utils/debounce.js";
import {formatNumberPrecision} from "../../utils/numberFormat.js";
import Store from "../../stores";
import {
    GET_REWARDS,
    WITHDRAW,
    CALCULATE_AMOUNT,
    CALCULATE_AMOUNT_RETURNED,
    CALCULATE_BPT_AMOUNT,
    CALCULATE_BPT_AMOUNT_RETURNED
} from "../../constants";

import config, {tokensName} from "../../config";

const dispatcher = Store.dispatcher;
const emitter = Store.emitter;

const styles = theme => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
        textAlign: "center"
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
    buttonSecondary: {
        background:
            "linear-gradient(135deg, #FF3A33 0%, #FC06C6 100%, #FF3A33)",
        borderRadius: "26px",
        // fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: "20px",
        lineHeight: "34px",
        color: "#FFFFFF",
        height: "50px",
        margin: "16px 8px 32px 8px",
        "&:hover": {
            background:
                "linear-gradient(315deg, #FF78E1 0%, #FF736E 100%, #FF78E1)"
        },
        "&.Mui-disabled": {
            background:
                "linear-gradient(135deg, rgb(255, 58, 51, 0.12) 0%, rgb(252, 6, 198, 0.12) 100%, rgb(255, 58, 51, 0.12))",
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
        right: 0,
        top: 0,
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

const StyledTabs = withStyles({
    indicator: {
        display: "flex",
        justifyContent: "center",
        backgroundColor: "transparent",
        "& > span": {
            maxWidth: 40,
            width: "100%",
            backgroundColor: "#635ee7"
        }
    }
})(props => <Tabs {...props} TabIndicatorProps={{children: <span />}} />);

const StyledTab = withStyles(theme => ({
    root: {
        flex: "1",
        textTransform: "none",
        color: "#ACAEBC",
        fontWeight: theme.typography.fontWeightRegular,
        fontSize: "20px",
        lineHeight: "20px",
        textAlign: "center",
        "&:focus": {
            opacity: 1,
            color: "#1E304B"
        },
        "&.Mui-selected": {
            opacity: 1,
            color: "#1E304B"
        }
    }
}))(props => <Tab disableRipple {...props} />);

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
            curTab: 0,
            pool: curPool,
            token: curPool.tokens[0],
            amount: "0",
            availableAmount: "0",
            loading: false,
            availableAmountLoading: true
        };
    }

    componentDidMount() {
        this.calculateAmount();
    }

    componentWillMount() {
        emitter.on(
            CALCULATE_AMOUNT_RETURNED,
            this.setAvailableAmount.bind(this)
        );
        emitter.on(CALCULATE_BPT_AMOUNT_RETURNED, this.setBptAmount.bind(this));
    }

    componentWillUnmount() {
        emitter.removeListener(
            CALCULATE_AMOUNT_RETURNED,
            this.setAvailableAmount.bind(this)
        );
        emitter.removeListener(
            CALCULATE_BPT_AMOUNT_RETURNED,
            this.setBptAmount.bind(this)
        );
    }

    tapHandleChange = (event, newValue) => {
        this.setState({
            curTab: newValue
        });
    };

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
        const that = this;
        this.setState(
            {
                amount: event.target.value
            },
            () => {
                that.calculateBptAmount();
            }
        );
    };

    getMaxAmount = () => {
        const pool = this.state.pool;

        return pool.type === "seed"
            ? formatNumberPrecision(pool.stakeAmount)
            : this.state.token == pool.tokens[0] ? (parseFloat(this.state.availableAmount) >
              parseFloat(pool.maxSyxOut)
            ? formatNumberPrecision(pool.maxSyxOut)
            : formatNumberPrecision(this.state.availableAmount)):(parseFloat(this.state.availableAmount) >
              parseFloat(pool.maxErc20Out)
            ? formatNumberPrecision(pool.maxErc20Out)
            : formatNumberPrecision(this.state.availableAmount));
    };

    max = () => {
        const that = this;
        this.setState(
            {
                amount: that.getMaxAmount() + ""
            },
            () => {
                that.calculateBptAmount();
            }
        );
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

        let amount;
        if (this.state.pool.type === "seed") {
            amount = parseFloat(this.state.amount).toString();
            dispatcher.dispatch({
                type: WITHDRAW,
                content: {
                    asset: this.state.pool,
                    amount,
                    token: ""
                }
            });
        } else {
            dispatcher.dispatch({
                type: WITHDRAW,
                content: {
                    asset: this.state.pool,
                    amount:(parseFloat(this.state.bptAmount)*0.99999).toString(),//Coverage contract calculation accuracy error,When the token decimals on both sides are inconsistent
                    token:
                        this.state.token === this.state.pool.tokens[1]
                            ? this.state.pool.erc20Address
                            : this.state.pool.erc20Address2
                }
            });
        }
    };

    setAvailableAmount(data) {
        this.setState({
            availableAmount: data,
            availableAmountLoading: false
        });
    }

    setBptAmount(data) {
        this.setState({
            loading: false,
            bptAmount: data
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
                    this.state.token === this.state.pool.tokens[1]
                        ? this.state.pool.erc20Address
                        : this.state.pool.erc20Address2
            }
        });
    };

    calculateBptAmount = () => {
        const that = this;
        that.setState({
            loading: true
        });
        debounce(
            1000,
            () => {
                if(!Number.isNaN(parseFloat(that.state.amount))){
                    dispatcher.dispatch({
                        type: CALCULATE_BPT_AMOUNT,
                        content: {
                            asset: that.state.pool,
                            amount: parseFloat(that.state.amount),
                            token:
                                that.state.token === that.state.pool.tokens[1]
                                    ? that.state.pool.erc20Address
                                    : that.state.pool.erc20Address2
                        }
                    });
                }else{
                    that.setState({
                        loading: false
                    });
                }
            },
            that
        )();
    };

    onClaim = () => {
        this.setState({
            loading: true
        });

        dispatcher.dispatch({
            type: GET_REWARDS,
            content: {
                asset: this.state.pool
            }
        });
    };

    render() {
        const {classes, data, closeModal, modalOpen} = this.props;
        const {loading} = this.state;
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
                    <StyledTabs
                        value={this.state.curTab}
                        onChange={this.tapHandleChange.bind(this)}
                        aria-label=""
                    >
                        <StyledTab
                            label={
                                <FormattedMessage id="RP_WITHDRAW_REWARDS" />
                            }
                        />
                        <StyledTab
                            label={
                                <FormattedMessage id="POPUP_TITLE_UNSTAKE" />
                            }
                        />
                    </StyledTabs>
                </DialogTitle>
                <DialogContent>
                    {this.state.curTab === 1 ? (
                        <>
                            <div className={classes.customSelect}>
                                <FormattedMessage id="RP_LIST_TITLE" />:
                                <img
                                    className={classes.icon}
                                    src={"/" + this.state.pool.name + ".png"}
                                    alt=""
                                />
                                {this.state.pool.id}
                                <Select
                                    value={this.state.pool.index}
                                    onChange={this.poolHandleChange.bind(this)}
                                >
                                    {data.map((v, i) => {
                                        if (v.entryContractAddress) {
                                            return (
                                                <MenuItem
                                                    value={v.index}
                                                    key={i}
                                                >
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

                            <div style={{fontSize: "16px"}}>
                                <span style={{color: "#ACAEBC"}}>
                                    <FormattedMessage id="POPUP_WITHDRAWABLE_AMOUNT" />
                                </span>
                                <span style={{float: "right"}}>
                                    {this.state.pool.type === "seed" ? (
                                        <NumberFormat value={this.state.pool.stakeAmount} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} decimalScale={4} fixedDecimalScale={true} />
                                    ) : this.state.availableAmountLoading ? (
                                        <CircularProgress
                                            style={{
                                                width: "24px",
                                                height: "24px"
                                            }}
                                        ></CircularProgress>
                                    ) : this.state.token === this.state.pool.tokens[1]?(parseFloat(this.state.availableAmount) >
                                      parseFloat(this.state.pool.maxErc20Out) ? 
                                          <NumberFormat value={this.state.pool.maxErc20Out} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} decimalScale={4} fixedDecimalScale={true} />
                                     
                                     : 
                                        <NumberFormat value={this.state.availableAmount} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} decimalScale={4} fixedDecimalScale={true} />
                                     
                                    ):(parseFloat(this.state.availableAmount) >
                                      parseFloat(this.state.pool.maxSyxOut) ? 
                                          <NumberFormat value={this.state.pool.maxSyxOut} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} decimalScale={4} fixedDecimalScale={true} />
                                        
                                     : 
                                        <NumberFormat value={this.state.availableAmount} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} decimalScale={4} fixedDecimalScale={true} />
                                    )}
                                    {" " + tokensName[this.state.token.toLowerCase()]}
                                </span>
                            </div>
                            <div className={classes.formContent}>
                                <FormControl
                                    variant="outlined"
                                    style={{flex: "4"}}
                                >
                                    <OutlinedInput
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
                                                                this.state
                                                                    .amount
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
                                        {this.state.pool.tokens.map((v, i) => (
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
                            {this.state.curTab === 1 ? (
                                <>
                                    <Typography gutterBottom>
                                        <span className={classes.text}>
                                            <FormattedMessage id="POPUP_WITHDRAW_AMOUNT" />
                                        </span>
                                        <NumberFormat value={this.state.amount} defaultValue={'0'} displayType={'text'} thousandSeparator={true} isNumericString={true} suffix={tokensName[this.state.token.toLowerCase()]} decimalScale={4} fixedDecimalScale={true} renderText={value => <span className={classes.rightText}>{value}</span>}/>
                                        
                                    </Typography>
                                    <Typography gutterBottom>
                                        <span className={classes.text}>
                                            <FormattedMessage id="POPUP_WITHDRAW_REWARD" />
                                        </span>
                                        <NumberFormat value={this.state.pool.rewardsAvailable} defaultValue={'0'} displayType={'text'} thousandSeparator={true} isNumericString={true} suffix={tokensName[this.state.pool.rewardsSymbol.toLowerCase()]} decimalScale={4} fixedDecimalScale={true} renderText={value => <span className={classes.rightText}>{value}</span>}/>
                                    </Typography>
                                </>
                            ) : (
                                <></>
                            )}
                        </>
                    ) : (
                        <>
                            <Typography
                                gutterBottom
                                style={{marginBottom: "16px"}}
                            >
                                <span style={{color: "#ACAEBC"}}>
                                    <FormattedMessage id="WITHDRAWABLE_REWARDS" />
                                    {": "}
                                </span>
                                <span style={{float: "right"}}>
                                    <img
                                        className={classes.icon}
                                        src={"/"+this.state.pool.rewardsSymbol+".png"}
                                        alt=""
                                    />{" "}
                                    <NumberFormat value={this.state.pool.rewardsAvailable} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} suffix={tokensName[this.state.pool.rewardsSymbol.toLowerCase()]} decimalScale={4} fixedDecimalScale={true} />
                                </span>
                            </Typography>
                            <div className={classes.customSelect}>
                                <FormattedMessage id="RP_LIST_TITLE" />:
                                <img
                                    className={classes.icon}
                                    src={"/" + this.state.pool.name + ".png"}
                                    alt=""
                                />
                                {this.state.pool.id}
                                <Select
                                    value={this.state.pool.index}
                                    onChange={this.poolHandleChange.bind(this)}
                                >
                                    {data.map((v, i) => {
                                        if (v.entryContractAddress) {
                                            return (
                                                <MenuItem
                                                    value={v.index}
                                                    key={i}
                                                >
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
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    {this.state.curTab === 1 ? (
                        <Button
                            className={classes.button}
                            disabled={loading}
                            autoFocus
                            onClick={this.confirm}
                            fullWidth={true}
                        >
                            {loading ? (
                                <CircularProgress></CircularProgress>
                            ) : (
                                <FormattedMessage id="LP_WITHDRAW" />
                            )}
                        </Button>
                    ) : (
                        <Button
                            className={classes.buttonSecondary}
                            disabled={loading}
                            autoFocus
                            onClick={this.onClaim}
                            fullWidth={true}
                        >
                            {loading ? (
                                <CircularProgress></CircularProgress>
                            ) : (
                                <FormattedMessage id="RP_WITHDRAW_REWARDS" />
                            )}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        );
    }
}

export default withStyles(styles)(WithdrawRewardsModal);
