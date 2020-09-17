import React, {Component} from "react";
import {FormattedMessage} from "react-intl";
import {withStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
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

import Store from "../../stores";
import {GET_REWARDS, WITHDRAW} from "../../constants";

const dispatcher = Store.dispatcher;

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
            amount: "0"
        };
    }

    tapHandleChange = (event, newValue) => {
        this.setState({
            curTab: newValue
        });
        console.log(this.state.curTab);
    };

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
                                    <FormattedMessage id="POPUP_WALLET_BALANCE" />
                                </span>
                                <span style={{float: "right"}}>
                                    {this.state.token == "SYX" ? (
                                        <img
                                            className={classes.icon}
                                            src={"/SYX.png"}
                                            alt=""
                                        />
                                    ) : (
                                        <img
                                            className={classes.icon}
                                            src={
                                                "/" +
                                                this.state.pool.name +
                                                ".png"
                                            }
                                            alt=""
                                        />
                                    )}
                                    {this.state.pool.type == "seed"
                                        ? parseFloat(
                                              this.state.pool.stakeAmount
                                          )
                                        : this.state.token == "SYX"
                                        ? (parseFloat(
                                              this.state.pool.stakeAmount
                                          ) *
                                              parseFloat(
                                                  this.state.pool.BPTPrice
                                              )) /
                                              parseFloat(
                                                  this.state.pool.price
                                              ) >
                                          parseFloat(this.state.pool.maxSyxOut)
                                            ? parseFloat(
                                                  this.state.pool.maxSyxOut
                                              ).toFixed(4)
                                            : (
                                                  (parseFloat(
                                                      this.state.pool
                                                          .stakeAmount
                                                  ) *
                                                      parseFloat(
                                                          this.state.pool
                                                              .BPTPrice
                                                      )) /
                                                  parseFloat(
                                                      this.state.pool.price
                                                  )
                                              ).toFixed(4)
                                        : parseFloat(
                                              this.state.pool.stakeAmount
                                          ) *
                                              parseFloat(
                                                  this.state.pool.BPTPrice
                                              ) >
                                          parseFloat(
                                              this.state.pool.maxErc20Out
                                          )
                                        ? parseFloat(
                                              this.state.pool.maxErc20Out
                                          ).toFixed(4)
                                        : (
                                              parseFloat(
                                                  this.state.pool.stakeAmount
                                              ) *
                                              parseFloat(
                                                  this.state.pool.BPTPrice
                                              )
                                          ).toFixed(4)}
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
                                        value={this.state.token}
                                        onChange={this.handleChange.bind(this)}
                                        inputProps={{
                                            name: "token",
                                            id: "outlined-token"
                                        }}
                                    >
                                        {this.state.pool.tokens.map(v => (
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
                        </>
                    ) : (
                        <>
                            <Typography gutterBottom>
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
                            className={classes.buttonSecondary}
                            autoFocus
                            onClick={this.confirm}
                            fullWidth={true}
                        >
                            <FormattedMessage id="LP_WITHDRAW" />
                        </Button>
                    ) : (
                        <Button
                            className={classes.button}
                            autoFocus
                            onClick={this.onClaim}
                            fullWidth={true}
                        >
                            <FormattedMessage id="RP_WITHDRAW_REWARDS" />
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        );
    }
}

export default withStyles(styles)(WithdrawRewardsModal);
