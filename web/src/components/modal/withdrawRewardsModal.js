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

import Store from "../../stores";
import {
    GET_REWARDS,
    WITHDRAW,
    CALCULATE_AMOUNT,
    CALCULATE_AMOUNT_RETURNED,
    CALCULATE_BPT_AMOUNT,
    CALCULATE_BPT_AMOUNT_RETURNED
} from "../../constants";

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

    //rate limiting
    debounce = (idle, action) => {
        const that = this;
        return function () {
            var ctx = this,
                args = arguments;
            clearTimeout(that.state.last);
            const id = setTimeout(function () {
                action.apply(ctx, args); // take action after `idle` amount of milliseconds delay
            }, idle);
            that.setState({
                last: id
            });
        };
    };

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
        this.setState(
            {
                pool: this.props.data[event.target.value],
                token: this.props.data[event.target.value].tokens[0]
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
        const formatNumberPrecision = this.formatNumberPrecision;

        return pool.type === "seed"
            ? formatNumberPrecision(pool.stakeAmount)
            : parseFloat(this.state.availableAmount) >
              parseFloat(pool.maxSyxOut)
            ? formatNumberPrecision(pool.maxSyxOut)
            : formatNumberPrecision(this.state.availableAmount);
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
                    amount: this.state.bptAmount,
                    token:
                        this.state.token === "SYX"
                            ? this.state.pool.rewardsAddress
                            : this.state.pool.erc20Address
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
                    this.state.token === "SYX"
                        ? this.state.pool.rewardsAddress
                        : this.state.pool.erc20Address
            }
        });
    };

    calculateBptAmount = () => {
        this.setState({
            loading: true
        });
        this.debounce(1000, () => {
            dispatcher.dispatch({
                type: CALCULATE_BPT_AMOUNT,
                content: {
                    asset: this.state.pool,
                    amount: this.state.amount,
                    token:
                        this.state.token === "SYX"
                            ? this.state.pool.rewardsAddress
                            : this.state.pool.erc20Address
                }
            });
        })();
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
                            <Typography gutterBottom>
                                <span style={{color: "#ACAEBC"}}>
                                    <FormattedMessage id="POPUP_WITHDRAWABLE_AMOUNT" />
                                </span>
                                <span style={{float: "right"}}>
                                    {this.state.pool.type === "seed" ? (
                                        parseFloat(this.state.pool.stakeAmount)
                                    ) : this.state.availableAmountLoading ? (
                                        <CircularProgress
                                            style={{
                                                width: "24px",
                                                height: "24px"
                                            }}
                                        ></CircularProgress>
                                    ) : parseFloat(this.state.availableAmount) >
                                      parseFloat(this.state.pool.maxSyxOut) ? (
                                        parseFloat(
                                            this.state.pool.maxSyxOut
                                        ).toFixed(4)
                                    ) : (
                                        parseFloat(
                                            this.state.availableAmount
                                        ).toFixed(4)
                                    )}
                                    {" " + this.state.token}
                                </span>
                            </Typography>
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
                                                {v}
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
                                        <span className={classes.rightText}>
                                            {this.state.amount || "0"}{" "}
                                            {this.state.token}
                                        </span>
                                    </Typography>
                                    <Typography gutterBottom>
                                        <span className={classes.text}>
                                            <FormattedMessage id="POPUP_WITHDRAW_REWARD" />
                                        </span>
                                        <span className={classes.rightText}>
                                            {parseFloat(
                                                this.state.pool.rewardsAvailable
                                            ).toFixed(4)}{" "}
                                            SYX
                                        </span>
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
                                        src={"/SYX.png"}
                                        alt=""
                                    />{" "}
                                    {parseFloat(
                                        this.state.pool.rewardsAvailable
                                    ).toFixed(4) + " SYX"}
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
