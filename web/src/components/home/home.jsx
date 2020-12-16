import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import {withStyles} from "@material-ui/core/styles";
import {
    Button,
    Grid,
    Paper,
    Typography,
    Divider,
    Container,
    Hidden,
    Collapse,
    Card,
    CardActions,
    CardContent
} from "@material-ui/core";

import {FormattedMessage} from "react-intl";
import NumberFormat from "react-number-format";
import {Web3Context} from "../../contexts/Web3Context";
import config, {tokensName} from "../../config";
import Snackbar from "../snackbar";
import {Header} from "../header";
import Footer from "../footer";
import Pool from "../pool";
import Balance from "../balance";
// import UnlockModal from "../unlock/unlockModal";
import DepositModal from "../modal/depositModal";
import TransactionModal from "../modal/transactionModal";
import WithdrawRewardsModal from "../modal/withdrawRewardsModal";
import NetworkErrModal from "../modal/networkErrModal";

import Loader from "../loader";
import Store from "../../stores";
import "./home.scss";

import {
    ERROR,
    WITHDRAW_RETURNED,
    DEPOSIT_RETURNED,
    TRADE_RETURNED,
    TX_CONFIRM,
    GET_REWARDS_RETURNED,
    CONNECTION_DISCONNECTED,
    GET_BALANCES_PERPETUAL_RETURNED,
    GET_BALANCES_PERPETUAL,
    CREATE_ENTRY_CONTRACT,
    CREATE_ENTRY_CONTRACT_RETURNED
} from "../../constants";

const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = theme => ({
    root: {
        width: "100%",
        background: "#FFFFFF",
        borderRadius: "12px",
        boxShadow: "0px 0px 35px 0px rgba(94, 85, 126, 0.15)",

        "& Button": {
            minWidth: "237px"
        }
    },
    title: {
        fontStyle: "normal",
        fontWeight: "500",
        fontSize: "32px",
        lineHeight: "45px",
        textAlign: "center",
        color: "#1E304B",
        margin: "45px auto"
    },
    headerTitle: {
        // fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: "500",
        fontSize: "60px",
        lineHeight: "70px",
        textAlign: "center",
        color: "#FFFFFF"
    },
    headerTitleSecondary: {
        fontStyle: "normal",
        fontWeight: "400",
        fontSize: "24px",
        lineHeight: "29px",
        textAlign: "center",
        color: "#FFFFFF",
        mixBlendMode: "normal",
        opacity: 0.6,
        margin: "20px auto 80px auto"
    },
    tableHeader: {
        height: "80px",
        "& td": {
            // fontFamily: "Noto Sans SC",
            fontStyle: "normal",
            fontWeight: "300 !important",
            fontSize: "20px",
            lineHeight: "28px",
            color: "#ACAEBC",
            padding: "26px 25px"
        }
    },
    tableBody: {
        height: "100px",
        "& td": {
            // fontFamily: "Noto Sans SC",
            fontStyle: "normal",
            fontSize: "20px",
            lineHeight: "24px",
            padding: "38px 25px"
        }
    },
    icon: {
        width: "36px",
        height: "36px",
        position: "relative",
        marginTop: "-6px",
        marginRight: "8px",
        display: "inline-block",
        verticalAlign: "middle"
    },
    walletIcon: {
        width: "24px",
        height: "24px",
        marginRight: "8px"
    },
    iconSecondary: {
        width: "51px",
        height: "24px",
        marginLeft: "8px"
    },
    button: {
        background:
            "linear-gradient(135deg, #42D9FE 0%, #2872FA 100%, #42D9FE)",
        borderRadius: "26px",
        // fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: "20px",
        color: "#FFFFFF",
        minWidth: "115px",
        marginTop: "-15px",
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
        color: "#FFFFFF",
        minWidth: "115px",
        marginTop: "-15px",
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
    paper: {
        padding: theme.spacing(2),
        textAlign: "center",
        color: theme.palette.text.secondary,
        height: "100%"
    },
    actions: {
        height: "79px",
        padding: "46px 36px",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: "18px",
        lineHeight: "25px",
        color: "#C0C1CE",
        overflowX: "scroll",
        overflowY: "hidden"
    },
    actionsSm: {
        textAlign: "left",
        color: "#1E304B",
        fontFamily: "Oswald",
        fontSize: "24px",
        fontWeight: 300,
        display: "block",
        padding: "13px 32px",
        "& span": {
            float: "right"
        }
    },
    paperTitle: {
        // fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: "400",
        fontSize: "20px",
        lineHeight: "28px",
        color: "#ACAEBC"
    },
    paperTitleSecondary: {
        fontFamily: "Oswald",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: "46px",
        lineHeight: "56px",
        color: "#1E304B",
        paddingTop: "18px",

        "& .small-text": {
            fontSize: "20px",
            lineHeight: "28px",
            color: "#454862"
        }
    },
    paperTip: {
        // fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: "300",
        fontSize: "16px",
        lineHeight: "22px",
        textAlign: "center",
        color: "#ACAEBC",
        margin: "24px auto 0px auto"
    },
    divider: {
        position: "absolute",
        height: "50%",
        left: "50%",
        top: "25%"
    },
    balanceBar: {
        textAlign: "left",
        color: "white",
        fontSize: "24px",
        "& div": {
            display: "flex"
        }
    },
    collapse: {
        background: "#EEF6FF",
        padding: "10px 22px",
        textAlign: "left",
        fontSize: "18px",
        color: "#C0C1CE",
        position: "relative"
    },
    customAlert: {
        "& .MuiAlert-message": {
            width: "100%",
            textAlign: "center"
        }
    }
});

class Home extends Component {
    static contextType = Web3Context;
    constructor(props) {
        super(props);
        
        const rewardPools = store.getStore("rewardPools");
        this.state = {
            rewardPools,
            loading: true,
            txLoading: false,
            // modalOpen: false,
            depositModalOpen: false,
            withdrawRewardsModalOpen: false,
            transactionModalOpen: false
        };
    }

    componentWillMount() {
        emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
        emitter.on(GET_BALANCES_PERPETUAL_RETURNED, this.getBalancesReturned);
        emitter.on(ERROR, this.errorReturned);
        emitter.on(DEPOSIT_RETURNED, this.showHash);
        emitter.on(WITHDRAW_RETURNED, this.showHash);
        emitter.on(TRADE_RETURNED, this.showHash);
        emitter.on(GET_REWARDS_RETURNED, this.showHash);
        emitter.on(CREATE_ENTRY_CONTRACT_RETURNED, this.showHash);
        emitter.on(TX_CONFIRM, this.hideLoading);
        emitter.on("accountsChanged", () => {
            this.setState({loading: true},()=>{
                dispatcher.dispatch({
                    type: GET_BALANCES_PERPETUAL,
                    content: {}
                });
            });      
        })
    }

    componentDidMount() {
        const networkId = store.getStore("networkId");
        this.setState({
            networkId
        });

        const that = this;
        setTimeout(async () => {
            const account = store.getStore("account");
            that.setState({
                account
            });
            dispatcher.dispatch({
                type: GET_BALANCES_PERPETUAL,
                content: {}
            });
        }, 2000);
    }
    componentWillUnmount() {
        emitter.removeListener(
            CONNECTION_DISCONNECTED,
            this.connectionDisconnected
        );
        emitter.removeListener(
            GET_BALANCES_PERPETUAL_RETURNED,
            this.getBalancesReturned
        );
        emitter.removeListener(DEPOSIT_RETURNED, this.showHash);
        emitter.removeListener(WITHDRAW_RETURNED, this.showHash);
        emitter.removeListener(TRADE_RETURNED, this.showHash);
        emitter.removeListener(GET_REWARDS_RETURNED, this.showHash);
        emitter.removeListener(CREATE_ENTRY_CONTRACT_RETURNED, this.showHash);
        emitter.removeListener(ERROR, this.errorReturned);
        emitter.removeListener(TX_CONFIRM, this.hideLoading);
    }

    connectionDisconnected = () => {
        this.setState({account: store.getStore("account")});
    };

    render() {
        const {classes} = this.props;
        const {
            // modalOpen,
            depositModalOpen,
            withdrawRewardsModalOpen,
            transactionModalOpen,
            rewardPools,
            snackbarMessage,
            loading,
            txLoading
        } = this.state;

        if (!rewardPools) {
            return null;
        }

        let rewardApr = 0,
            rewardsAvailable = 0,
            totalStakeAmount = 0;
        if (this.state.rewardPools) {
            this.state.rewardPools.forEach(pool => {
                const toSyxAmount =
                    (parseFloat(pool.stakeAmount) * parseFloat(pool.BPTPrice)) /
                    parseFloat(pool.price);
                rewardApr += parseFloat(pool.rewardApr) * toSyxAmount;
                rewardsAvailable += parseFloat(pool.rewardsAvailable || 0);
                totalStakeAmount += toSyxAmount;
            });

            rewardApr =
                totalStakeAmount > 0
                    ? (rewardApr / totalStakeAmount).toFixed(1)
                    : "0.0";
            rewardsAvailable = rewardsAvailable.toFixed(4);
        }

        let balanceSet = new Set();
        let hasJoinedCount = 0;
        rewardPools.forEach(data => {
            if (data.entryContractAddress) {
                hasJoinedCount++;
            }
            balanceSet.add(
                JSON.stringify({
                    name: data.name,
                    erc20Balance: data.erc20Balance
                })
            );
        });

        return (
            <div>
                <Header />
                <Container>
                    <Hidden xsDown>
                        <Typography
                            className={classes.headerTitle}
                            gutterBottom
                        >
                            <FormattedMessage id="HOME_TITLE" />
                        </Typography>
                        <Typography
                            className={classes.headerTitleSecondary}
                            gutterBottom
                        >
                            <FormattedMessage id="HOME_SUBTITLE" />
                        </Typography>
                    </Hidden>
                    <Hidden smUp>
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
                                {rewardPools.length > 0 ? (
                                    <Balance
                                        outline={true}
                                        name={rewardPools[0].rewardsSymbol}
                                        balance={rewardPools[0].rewardsBalance}
                                    />
                                ) : (
                                    <></>
                                )}
                                {Array.from(balanceSet).map((data, i) => (
                                    <Balance
                                        key={i}
                                        outline={true}
                                        name={JSON.parse(data).name}
                                        balance={JSON.parse(data).erc20Balance}
                                    />
                                ))}
                            </div>
                        </div>
                    </Hidden>
                    <Hidden xsDown>
                        <Card className={classes.root}>
                            <CardActions className={classes.actions}>
                                <img
                                    className={classes.walletIcon}
                                    src={"/wallet.svg"}
                                    alt=""
                                />
                                <FormattedMessage id="WALLET_BALANCE" />
                                {rewardPools.length > 0 ? (
                                    <Balance
                                        name={rewardPools[0].rewardsSymbol}
                                        balance={rewardPools[0].rewardsBalance}
                                    />
                                ) : (
                                    <></>
                                )}
                                {Array.from(balanceSet).map((data, i) => (
                                    <Balance
                                        key={i}
                                        name={JSON.parse(data).name}
                                        balance={JSON.parse(data).erc20Balance}
                                    />
                                ))}
                            </CardActions>
                            <Divider />
                            <CardContent>
                                <Grid
                                    container
                                    spacing={3}
                                    style={{position: "relative"}}
                                >
                                    <Grid item xs={12} sm={6}>
                                        <Paper className={classes.paper}>
                                            <Typography
                                                className={classes.paperTitle}
                                                gutterBottom
                                            >
                                                <FormattedMessage id="MY_STAKING_APR" />
                                            </Typography>
                                            <Typography
                                                className={
                                                    classes.paperTitleSecondary
                                                }
                                                gutterBottom
                                            >
                                                <NumberFormat
                                                    value={rewardApr || 0}
                                                    defaultValue={"-"}
                                                    displayType={"text"}
                                                    thousandSeparator={true}
                                                    isNumericString={true}
                                                    decimalScale={1}
                                                    fixedDecimalScale={true}
                                                />
                                                <span className="small-text">
                                                    {" "}
                                                    %
                                                </span>
                                            </Typography>
                                            {hasJoinedCount === 0 ? (
                                                <Button
                                                    variant="contained"
                                                    className={
                                                        classes.buttonSecondary
                                                    }
                                                    style={{marginTop: "9px"}}
                                                    disabled={loading || txLoading}
                                                    onClick={() =>
                                                        this.createEntryContract(
                                                            rewardPools[0]
                                                        )
                                                    }
                                                >
                                                    <FormattedMessage id="JOIN" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    className={classes.button}
                                                    style={{marginTop: "9px"}}
                                                    variant="contained"
                                                    disabled={
                                                        hasJoinedCount === 0 ||
                                                        loading ||
                                                        txLoading
                                                    }
                                                    onClick={() =>
                                                        this.openDepositModal(
                                                            rewardPools
                                                        )
                                                    }
                                                >
                                                    <FormattedMessage id="DEPOSIT_INCENTIVE_PLAN" />
                                                </Button>
                                            )}

                                            <Typography
                                                className={classes.paperTip}
                                                gutterBottom
                                            >
                                                <FormattedMessage id="STAKING_TIP" />
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Hidden xsDown>
                                        <Divider
                                            className={classes.divider}
                                            orientation="vertical"
                                        />
                                    </Hidden>
                                    <Grid item xs={12} sm={6}>
                                        <Paper className={classes.paper}>
                                            <Typography
                                                className={classes.paperTitle}
                                                gutterBottom
                                            >
                                                <FormattedMessage id="WITHDRAWABLE_REWARDS" />
                                            </Typography>
                                            <Typography
                                                className={
                                                    classes.paperTitleSecondary
                                                }
                                                gutterBottom
                                            >
                                                <NumberFormat
                                                    value={
                                                        rewardsAvailable || 0
                                                    }
                                                    defaultValue={"-"}
                                                    displayType={"text"}
                                                    thousandSeparator={true}
                                                    isNumericString={true}
                                                    decimalScale={4}
                                                    fixedDecimalScale={true}
                                                />
                                                <span className="small-text">
                                                    SYX2
                                                </span>
                                            </Typography>
                                            <Button
                                                style={{marginTop: "9px"}}
                                                className={
                                                    classes.buttonSecondary
                                                }
                                                variant="contained"
                                                disabled={
                                                    hasJoinedCount === 0 ||
                                                    loading ||
                                                    txLoading
                                                }
                                                onClick={() => {
                                                    this.openWithdrawRewardsModal();
                                                }}
                                            >
                                                <FormattedMessage id="RP_WITHDRAW_REWARDS" />
                                            </Button>
                                            <Typography
                                                className={classes.paperTip}
                                                gutterBottom
                                            >
                                                <FormattedMessage id="WITHDRAW_REWARDS_TIP" />
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Hidden>
                    <Hidden smUp>
                        <Card className={classes.root}>
                            <CardActions className={classes.actionsSm}>
                                <FormattedMessage id="MY_STAKING_APR" />
                                <NumberFormat
                                    value={rewardApr || 0}
                                    defaultValue={"-"}
                                    displayType={"text"}
                                    thousandSeparator={true}
                                    isNumericString={true}
                                    suffix={"%"}
                                    decimalScale={1}
                                    fixedDecimalScale={true}
                                />
                            </CardActions>
                            <Divider />
                            <CardContent>
                                <Grid
                                    container
                                    spacing={3}
                                    style={{position: "relative"}}
                                >
                                    <Grid item xs={12}>
                                        <Paper className={classes.paper}>
                                            <Typography
                                                className={classes.paperTitle}
                                                gutterBottom
                                            >
                                                <FormattedMessage id="WITHDRAWABLE_REWARDS" />
                                            </Typography>
                                            <Typography
                                                className={
                                                    classes.paperTitleSecondary
                                                }
                                                gutterBottom
                                            >
                                                <NumberFormat
                                                    value={
                                                        rewardsAvailable || 0
                                                    }
                                                    defaultValue={"-"}
                                                    displayType={"text"}
                                                    thousandSeparator={true}
                                                    isNumericString={true}
                                                    suffix={"SYX2"}
                                                    decimalScale={4}
                                                    fixedDecimalScale={true}
                                                />
                                            </Typography>
                                            <Button
                                                style={{marginTop: "9px"}}
                                                className={
                                                    classes.buttonSecondary
                                                }
                                                variant="contained"
                                                disabled={
                                                    hasJoinedCount === 0 ||
                                                    loading ||
                                                    txLoading
                                                }
                                                onClick={() => {
                                                    this.openWithdrawRewardsModal();
                                                }}
                                            >
                                                <FormattedMessage id="RP_WITHDRAW_REWARDS" />
                                            </Button>
                                            <Typography
                                                className={classes.paperTip}
                                                gutterBottom
                                            >
                                                <FormattedMessage id="WITHDRAW_REWARDS_TIP" />
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Hidden>
                    <div className={classes.title}>
                        <FormattedMessage id="RP_LIST_TITLE" />
                    </div>
                    <Grid container spacing={3}>
                        {rewardPools.map((data, i) => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <Pool
                                    data={data}
                                    loading={loading || txLoading}
                                    onDeposit={() =>
                                        this.openDepositModal(data)
                                    }
                                    onJoin={() =>
                                        this.createEntryContract(data)
                                    }
                                />
                            </Grid>
                        ))}
                    </Grid>
                    <div className={"exchange-table"}>
                        <div className={classes.title}>
                            <FormattedMessage id="LP_LIST_TITLE" />
                        </div>
                        <div className="table-wrap">
                            <Hidden xsDown>
                                <table>
                                    <thead className="table-head">
                                        <tr className={classes.tableHeader}>
                                            <td>
                                                <FormattedMessage id="LP_TRADING_PAIR" />
                                            </td>
                                            <td>
                                                <FormattedMessage id="LP_SYX_PRICE" />
                                            </td>
                                            <td>
                                                <FormattedMessage id="LP_MY_SHARE" />
                                            </td>
                                            <td>
                                                <FormattedMessage id="RATIO" />
                                            </td>
                                            <td>
                                                <FormattedMessage id="ACTION" />
                                            </td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.rewardPools ? (
                                            this.state.rewardPools.map((pool, i) => {
                                                if (pool.type !== "seed") {
                                                    return (
                                                        <tr
                                                            key={i}
                                                            className={
                                                                classes.tableBody
                                                            }
                                                        >
                                                            <td>
                                                                <img
                                                                    className={
                                                                        classes.icon
                                                                    }
                                                                    src={
                                                                        "/" +
                                                                        (
                                                                            (pool.id == "ETH/VLX" || pool.id == "USDT/VLX") ?
                                                                            pool
                                                                            .tokens[1] :
                                                                            pool
                                                                            .tokens[0]
                                                                        )
                                                                        +
                                                                        ".png"
                                                                    }
                                                                    style={{
                                                                        marginRight:
                                                                            "-4px",
                                                                        zIndex: 2
                                                                    }}
                                                                    alt=""
                                                                />
                                                                <img
                                                                    className={
                                                                        classes.icon
                                                                    }
                                                                    src={
                                                                        "/" +
                                                                        (
                                                                            (pool.id == "ETH/VLX" || pool.id == "USDT/VLX") ?
                                                                            pool
                                                                            .tokens[0] :
                                                                            pool
                                                                            .tokens[1]
                                                                        )
                                                                        +
                                                                        ".png"
                                                                    } 
                                                                    alt=""
                                                                />
                                                                {
                                                                    pool.id == "ETH/VLX" ?
                                                                        "VLX/ETH" :
                                                                        (
                                                                            pool.id == "USDT/VLX" ? 
                                                                            "VLX/USDT" :
                                                                            pool.id
                                                                        )
                                                                }
                                                            </td>
                                                            <td>
                                                                <NumberFormat
                                                                    value={
                                                                        (
                                                                            (pool.id == "ETH/VLX" || pool.id == "USDT/VLX") ?
                                                                            (1 / pool.price) :
                                                                            pool.price
                                                                        ) || 0
                                                                    }
                                                                    defaultValue={
                                                                        "-"
                                                                    }
                                                                    displayType={
                                                                        "text"
                                                                    }
                                                                    thousandSeparator={
                                                                        true
                                                                    }
                                                                    isNumericString={
                                                                        true
                                                                    }
                                                                    suffix={
                                                                        " "+((pool.id == "ETH/VLX" || pool.id == "USDT/VLX") ?
                                                                        pool.tokens[0] :
                                                                        pool.tokens[1])
                                                                    }
                                                                    decimalScale={
                                                                        ((pool.id == "ETH/VLX") ? 6 : 4)
                                                                    }
                                                                    fixedDecimalScale={
                                                                        true
                                                                    }
                                                                />
                                                            </td>
                                                            <td>
                                                                {pool.totalSupply >
                                                                0 ? (
                                                                    <NumberFormat
                                                                        value={(
                                                                            (parseFloat(
                                                                                pool.stakeAmount
                                                                            ) /
                                                                                parseFloat(
                                                                                    pool.totalSupply
                                                                                )) *
                                                                            100
                                                                        ).toLocaleString(
                                                                            undefined,
                                                                            {
                                                                                maximumFractionDigits: 10
                                                                            }
                                                                        )}
                                                                        defaultValue={
                                                                            "-"
                                                                        }
                                                                        displayType={
                                                                            "text"
                                                                        }
                                                                        thousandSeparator={
                                                                            true
                                                                        }
                                                                        isNumericString={
                                                                            true
                                                                        }
                                                                        suffix={
                                                                            "%"
                                                                        }
                                                                        decimalScale={
                                                                            2
                                                                        }
                                                                        fixedDecimalScale={
                                                                            true
                                                                        }
                                                                    />
                                                                ) : (
                                                                    "0.00 %"
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div>
                                                                    {
                                                                        (
                                                                            (pool.id == "ETH/VLX" || pool.id == "USDT/VLX") && pool.weight ?
                                                                            (pool.weight.split(":")[1]+":"+pool.weight.split(":")[0]) :
                                                                            pool.weight
                                                                        )
                                                                    }
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <Button
                                                                    className={
                                                                        classes.button
                                                                    }
                                                                    size="small"
                                                                    variant="contained"
                                                                    onClick={() => {
                                                                        this.openTransactionModal(
                                                                            pool
                                                                        );
                                                                    }}
                                                                    disabled={
                                                                        loading || txLoading
                                                                    }
                                                                >
                                                                    <FormattedMessage id="LP_SWAP" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                } else {
                                                    return (
                                                        <React.Fragment
                                                            key={i}
                                                        ></React.Fragment>
                                                    );
                                                }
                                            })
                                        ) : (
                                            <></>
                                        )}
                                    </tbody>
                                </table>
                            </Hidden>
                            <Hidden smUp>
                                <table>
                                    <thead className="table-head">
                                        <tr className={classes.tableHeader}>
                                            <td>
                                                <FormattedMessage id="LP_TRADING_PAIR" />
                                            </td>
                                            <td>
                                                <FormattedMessage id="LP_SYX_PRICE" />
                                            </td>
                                            <td>
                                                <FormattedMessage id="ACTION" />
                                            </td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.rewardPools ? (
                                            this.state.rewardPools.map((pool, i) => {
                                                if (pool.type !== "seed") {
                                                    return (
                                                        <React.Fragment key={i}>
                                                            <tr
                                                                className={
                                                                    classes.tableBody
                                                                }
                                                                onClick={() =>
                                                                    this.setState(
                                                                        {
                                                                            ["open" +
                                                                            i]: !this
                                                                                .state[
                                                                                "open" +
                                                                                    i
                                                                            ]
                                                                        }
                                                                    )
                                                                }
                                                            >
                                                                <td>
                                                                    <img
                                                                        className={
                                                                            classes.icon
                                                                        }
                                                                        src={
                                                                            "/" +
                                                                            (
                                                                                (pool.id == "ETH/VLX" || pool.id == "USDT/VLX") ?
                                                                                pool
                                                                                .tokens[1] :
                                                                                pool
                                                                                .tokens[0]
                                                                            ) +
                                                                            ".png"
                                                                        }
                                                                        style={{
                                                                            marginRight:
                                                                                "-4px",
                                                                            zIndex: 2
                                                                        }}
                                                                        alt=""
                                                                    />
                                                                    <img
                                                                        className={
                                                                            classes.icon
                                                                        }
                                                                        src={
                                                                            "/" +
                                                                            (
                                                                                (pool.id == "ETH/VLX" || pool.id == "USDT/VLX") ?
                                                                                pool
                                                                                .tokens[0] :
                                                                                pool
                                                                                .tokens[1]
                                                                            ) +
                                                                            ".png"
                                                                        } 
                                                                        alt=""
                                                                    />
                                                                    
                                                                    <span
                                                                        style={{
                                                                            paddingLeft:
                                                                                "5px"
                                                                        }}
                                                                    >
                                                                        {
                                                                            pool.id == "ETH/VLX" ?
                                                                            "VLX/ETH" :
                                                                            (
                                                                                pool.id == "USDT/VLX" ? 
                                                                                "VLX/USDT" :
                                                                                pool.id
                                                                            )
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <NumberFormat
                                                                        value={
                                                                            (
                                                                                (pool.id == "ETH/VLX" || pool.id == "USDT/VLX") ?
                                                                                (1 / pool.price) :
                                                                                pool.price
                                                                            ) || 0
                                                                        }
                                                                        defaultValue={
                                                                            "-"
                                                                        }
                                                                        displayType={
                                                                            "text"
                                                                        }
                                                                        thousandSeparator={
                                                                            true
                                                                        }
                                                                        isNumericString={
                                                                            true
                                                                        }
                                                                        decimalScale={
                                                                            ((pool.id == "ETH/VLX") ? 6 : 4)
                                                                        }
                                                                        fixedDecimalScale={
                                                                            true
                                                                        }
                                                                    />
                                                                    <div
                                                                        style={{
                                                                            color:
                                                                                "#a4a7be"
                                                                        }}
                                                                    >
                                                                        {
                                                                            (pool.id == "ETH/VLX" || pool.id == "USDT/VLX") ?
                                                                            pool.tokens[0] :
                                                                            pool.tokens[1]
                                                                        }
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <Button
                                                                        className={
                                                                            classes.button
                                                                        }
                                                                        size="small"
                                                                        variant="contained"
                                                                        onClick={() => {
                                                                            this.openTransactionModal(
                                                                                pool
                                                                            );
                                                                        }}
                                                                        disabled={
                                                                            loading || txLoading
                                                                        }
                                                                    >
                                                                        <FormattedMessage id="LP_SWAP" />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                            <Collapse
                                                                in={
                                                                    this.state[
                                                                        "open" +
                                                                            i
                                                                    ]
                                                                }
                                                                timeout="auto"
                                                                unmountOnExit
                                                                className={
                                                                    classes.collapse
                                                                }
                                                            >
                                                                <div className="triangle-up"></div>
                                                                <Grid
                                                                    container
                                                                    spacing={3}
                                                                >
                                                                    <Grid
                                                                        item
                                                                        xs={6}
                                                                    >
                                                                        {
                                                                            tokensName[pool
                                                                                .tokens[1].toLowerCase()]
                                                                        }
                                                                        :
                                                                        <NumberFormat
                                                                            value={
                                                                                pool.bptVlxBalance ||
                                                                                0
                                                                            }
                                                                            defaultValue={
                                                                                "-"
                                                                            }
                                                                            displayType={
                                                                                "text"
                                                                            }
                                                                            thousandSeparator={
                                                                                true
                                                                            }
                                                                            isNumericString={
                                                                                true
                                                                            }
                                                                            decimalScale={
                                                                                4
                                                                            }
                                                                            fixedDecimalScale={
                                                                                true
                                                                            }
                                                                            renderText={value => (
                                                                                <span
                                                                                    style={{
                                                                                        color:
                                                                                            "#1E304B",
                                                                                        paddingLeft:
                                                                                            "5px"
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        value
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                        />
                                                                    </Grid>
                                                                    <Grid
                                                                        item
                                                                        xs={6}
                                                                    >
                                                                        <FormattedMessage id="LP_MY_SHARE" />
                                                                        :
                                                                        <span
                                                                            style={{
                                                                                color:
                                                                                    "#1E304B",
                                                                                paddingLeft:
                                                                                    "5px"
                                                                            }}
                                                                        >
                                                                            {pool.totalSupply >
                                                                            0 ? (
                                                                                <NumberFormat
                                                                                    value={(
                                                                                        (parseFloat(
                                                                                            pool.stakeAmount
                                                                                        ) /
                                                                                            parseFloat(
                                                                                                pool.totalSupply
                                                                                            )) *
                                                                                        100
                                                                                    ).toLocaleString(
                                                                                        undefined,
                                                                                        {
                                                                                            maximumFractionDigits: 10
                                                                                        }
                                                                                    )}
                                                                                    defaultValue={
                                                                                        "-"
                                                                                    }
                                                                                    displayType={
                                                                                        "text"
                                                                                    }
                                                                                    thousandSeparator={
                                                                                        true
                                                                                    }
                                                                                    isNumericString={
                                                                                        true
                                                                                    }
                                                                                    suffix={
                                                                                        "%"
                                                                                    }
                                                                                    decimalScale={
                                                                                        2
                                                                                    }
                                                                                    fixedDecimalScale={
                                                                                        true
                                                                                    }
                                                                                />
                                                                            ) : (
                                                                                "0.00 %"
                                                                            )}
                                                                        </span>
                                                                    </Grid>
                                                                    <Grid
                                                                        item
                                                                        xs={6}
                                                                    >
                                                                        {
                                                                            tokensName[pool
                                                                                .tokens[0].toLowerCase()]
                                                                        }
                                                                        :
                                                                        <NumberFormat
                                                                            value={
                                                                                pool.bptSyxBalance ||
                                                                                0
                                                                            }
                                                                            defaultValue={
                                                                                "-"
                                                                            }
                                                                            displayType={
                                                                                "text"
                                                                            }
                                                                            thousandSeparator={
                                                                                true
                                                                            }
                                                                            isNumericString={
                                                                                true
                                                                            }
                                                                            decimalScale={
                                                                                4
                                                                            }
                                                                            fixedDecimalScale={
                                                                                true
                                                                            }
                                                                            renderText={value => (
                                                                                <span
                                                                                    style={{
                                                                                        color:
                                                                                            "#1E304B",
                                                                                        paddingLeft:
                                                                                            "5px"
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        value
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                        />
                                                                    </Grid>
                                                                    <Grid
                                                                        item
                                                                        xs={6}
                                                                    >
                                                                        <FormattedMessage id="RATIO" />
                                                                        :
                                                                        <span
                                                                            style={{
                                                                                color:
                                                                                    "#1E304B",
                                                                                paddingLeft:
                                                                                    "5px"
                                                                            }}
                                                                        >
                                                                            {
                                                                                (
                                                                                    (pool.id == "ETH/VLX" || pool.id == "USDT/VLX") && pool.weight ?
                                                                                    (pool.weight.split(":")[1]+":"+pool.weight.split(":")[0]) :
                                                                                    pool.weight
                                                                                )
                                                                            }
                                                                        </span>
                                                                    </Grid>
                                                                </Grid>
                                                            </Collapse>
                                                        </React.Fragment>
                                                    );
                                                } else {
                                                    return (
                                                        <React.Fragment
                                                            key={i}
                                                        ></React.Fragment>
                                                    );
                                                }
                                            })
                                        ) : (
                                            <></>
                                        )}
                                    </tbody>
                                </table>
                            </Hidden>
                        </div>
                    </div>
                </Container>
                {/* {modalOpen && this.renderModal()} */}
                {depositModalOpen &&
                    this.renderDepositModal(this.state.depositData)}
                {withdrawRewardsModalOpen &&
                    this.renderWithdrawRewardsModal(this.state.rewardPools)}
                {transactionModalOpen &&
                    this.renderTransactionModal(this.state.tradeData)}
                {this.state.networkId &&
                    this.state.networkId.toString() !==
                        config.requiredNetworkId.toString() &&
                    this.renderNetworkErrModal()}
                {snackbarMessage && this.renderSnackbar()}

                {(loading || txLoading) && <Loader />}
                <Footer />
            </div>
        );
    }

    showHash = txHash => {
        this.setState({
            snackbarMessage: null,
            snackbarType: null,
            depositModalOpen: false,
            withdrawRewardsModalOpen: false,
            transactionModalOpen: false,
            txLoading: true
        });
        const that = this;
        setTimeout(() => {
            const snackbarObj = {snackbarMessage: txHash, snackbarType: "Hash"};
            that.setState(snackbarObj);
        });

        setTimeout(() => {
            dispatcher.dispatch({type: GET_BALANCES_PERPETUAL, content: {}});
            this.hideLoading();
        }, 10000);
    };

    showLoading = () => {
        this.setState({txLoading: true});
    };

    hideLoading = () => {
        this.setState({
            txLoading: false
        });
    };

    createEntryContract = data => {
        const {account} = this.state;
        if (
            !Object.getOwnPropertyNames(account).length ||
            account.address === undefined
        ) {
            this.context.connectWeb3();
        } else {
            this.showLoading();
            setTimeout(() => {
                this.hideLoading();
            }, 5000);
            dispatcher.dispatch({
                type: CREATE_ENTRY_CONTRACT,
                content: {
                    asset: data
                }
            });
        }
    };

    errorReturned = error => {
        const snackbarObj = {snackbarMessage: null, snackbarType: null};
        this.setState(snackbarObj);
        this.setState({loading: false,txLoading:false});
        const that = this;
        setTimeout(() => {
            const snackbarObj = {
                snackbarMessage: error.toString(),
                snackbarType: "Error",
                depositModalOpen: false,
                withdrawRewardsModalOpen: false,
                transactionModalOpen: false
            };
            that.setState(snackbarObj);
        });
    };

    getBalancesReturned = () => {
        const rewardPools = store.getStore("rewardPools");
        this.setState({
            loading: false,
            rewardPools
        });

        const that = this;
        window.setTimeout(() => {
            const account = store.getStore("account");
            that.setState({
                account
            });
            dispatcher.dispatch({type: GET_BALANCES_PERPETUAL, content: {}});
        }, 10000);
    };

    openDepositModal = data => {
        this.setState({
            depositModalOpen: true,
            depositData: data
        });
    };

    openWithdrawRewardsModal = () => {
        this.setState({
            withdrawRewardsModalOpen: true
        });
    };

    openTransactionModal = data => {
        const {account} = this.state;
        if (
            !Object.getOwnPropertyNames(account).length ||
            account.address === undefined
        ) {
            // this.setState(() => ({
            //     modalOpen: true
            // }));
            this.context.connectWeb3();
        } else {
            this.setState({
                transactionModalOpen: true,
                tradeData: data
            });
        }
    };

    // closeUnlockModal = () => {
    //     this.setState({modalOpen: false});
    // };

    closeDepositModal = () => {
        this.setState({depositModalOpen: false});
    };

    closeWithdrawRewardsModal = () => {
        this.setState({withdrawRewardsModalOpen: false});
    };

    closeTransactionModal = () => {
        this.setState({transactionModalOpen: false});
    };

    renderSnackbar = () => {
        var {snackbarType, snackbarMessage} = this.state;
        return (
            <Snackbar
                type={snackbarType}
                message={snackbarMessage}
                open={true}
            />
        );
    };

    // renderModal = () => {
    //     return (
    //         <UnlockModal
    //             closeModal={this.closeUnlockModal}
    //             modalOpen={this.state.modalOpen}
    //         />
    //     );
    // };

    renderDepositModal = data => {
        return (
            <DepositModal
                data={data}
                loading={this.state.loading||this.state.txLoading}
                closeModal={this.closeDepositModal}
                modalOpen={this.state.depositModalOpen}
            />
        );
    };

    renderWithdrawRewardsModal = data => {
        return (
            <WithdrawRewardsModal
                data={data}
                loading={this.state.loading||this.state.txLoading}
                closeModal={this.closeWithdrawRewardsModal}
                modalOpen={this.state.withdrawRewardsModalOpen}
            />
        );
    };

    renderTransactionModal = data => {
        return (
            <TransactionModal
                data={data}
                loading={this.state.loading||this.state.txLoading}
                closeModal={this.closeTransactionModal}
                modalOpen={this.state.transactionModalOpen}
            />
        );
    };

    renderNetworkErrModal = () => {
        return <NetworkErrModal />;
    };
}

export default withRouter(withStyles(styles)(Home));
