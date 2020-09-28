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
import Alert from "@material-ui/lab/Alert";
import {FormattedMessage} from "react-intl";
import config from "../../config";
import Snackbar from "../snackbar";
import Header from "../header";
import Footer from "../footer";
import Pool from "../pool";
import Balance from "../balance";
import UnlockModal from "../unlock/unlockModal";
import DepositModal from "../modal/depositModal";
import TransactionModal from "../modal/transactionModal";
import WithdrawRewardsModal from "../modal/withdrawRewardsModal";
import NetworkErrModal from "../modal/networkErrModal";

import Loader from "../loader";
import Store from "../../stores";
import "./home.scss";

import {injected} from "../../stores/connectors";

import {
    ERROR,
    WITHDRAW_RETURNED,
    DEPOSIT_RETURNED,
    TRADE_RETURNED,
    TX_CONFIRM,
    GET_REWARDS_RETURNED,
    CONNECTION_CONNECTED,
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

        "& span": {
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
    constructor(props) {
        super(props);
        const account = store.getStore("account");
        const rewardPools = store.getStore("rewardPools");
        this.state = {
            rewardPools,
            loading: true,
            account,
            modalOpen: false,
            depositModalOpen: false,
            withdrawRewardsModalOpen: false,
            transactionModalOpen: false,
            showAlert: true
        };
    }

    componentWillMount() {
        emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
        emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
        emitter.on(GET_BALANCES_PERPETUAL_RETURNED, this.getBalancesReturned);
        emitter.on(ERROR, this.errorReturned);
        emitter.on(DEPOSIT_RETURNED, this.showHash);
        emitter.on(WITHDRAW_RETURNED, this.showHash);
        emitter.on(TRADE_RETURNED, this.showHash);
        emitter.on(GET_REWARDS_RETURNED, this.showHash);
        emitter.on(CREATE_ENTRY_CONTRACT_RETURNED, this.showHash);
        emitter.on(TX_CONFIRM, this.hideLoading);
        const that = this;
        injected.isAuthorized().then(isAuthorized => {
            if (isAuthorized) {
                injected
                    .activate()
                    .then(a => {
                        store.setStore({
                            account: {address: a.account},
                            web3context: {library: {provider: a.provider}}
                        });
                        that.setState({
                            networkId: a.provider.networkVersion
                        });
                        emitter.emit(CONNECTION_CONNECTED);
                    })
                    .catch(e => {
                        console.log(e);
                    });
            }
        });
    }
    componentDidMount() {
        const networkId = store.getStore("networkId");
        this.setState({
            networkId
        });

        if (window.ethereum && window.ethereum.on) {
            // metamask networkChange
            window.ethereum.autoRefreshOnNetworkChange = false;
            const that = this;
            window.ethereum.on("chainChanged", _chainId => {
                console.log("networkId: ", _chainId);
                if (window.sessionStorage.getItem("chainId") !== _chainId) {
                    window.sessionStorage.setItem("chainId", _chainId);
                    that.setState({
                        networkId: _chainId
                    });
                    window.location.reload();
                }
            });

            // metamask disConnect
            window.ethereum.on("disconnect", () => {
                console.log("disConnect");
            });
            // accountChange
            window.ethereum.on("accountsChanged", accounts => {
                const account = {address: accounts[0]};
                store.setStore("account", account);
                this.setState(() => ({
                    account
                }));
                if (
                    window.sessionStorage.getItem("accounts") !==
                    accounts[0] + ""
                ) {
                    window.sessionStorage.setItem("accounts", accounts[0]);
                    window.location.reload();
                }
            });
        } else {
            dispatcher.dispatch({type: GET_BALANCES_PERPETUAL, content: {}});
        }
        setTimeout(async () => {
            const {account} = this.state;
            //   console.log(account)
            if (
                !Object.getOwnPropertyNames(account).length ||
                account.address === undefined
            ) {
                dispatcher.dispatch({
                    type: GET_BALANCES_PERPETUAL,
                    content: {}
                });
        // this.setState(() => ({
        //     modalOpen: true
        // }));
            }
        }, 2000);
    }
    componentWillUnmount() {
        emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
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
        emitter.removeListener(ERROR, this.errorReturned);
        emitter.removeListener(TX_CONFIRM, this.hideLoading);
    }

    connectionConnected = async () => {
        dispatcher.dispatch({type: GET_BALANCES_PERPETUAL, content: {}});
        this.setState({account: store.getStore("account")});
        this.setState(() => ({
            modalOpen: false
        }));
    };

    connectionDisconnected = () => {
        this.setState({account: store.getStore("account")});
    };

    render() {
        const {classes} = this.props;
        const {
            account,
            modalOpen,
            depositModalOpen,
            withdrawRewardsModalOpen,
            transactionModalOpen,
            rewardPools,
            snackbarMessage,
            loading
        } = this.state;
        var address = null;
        if (account.address) {
            address =
                account.address.substring(0, 6) +
                "..." +
                account.address.substring(
                    account.address.length - 4,
                    account.address.length
                );
        }
        if (!rewardPools) {
            return null;
        }

        let rewardApr = 0,
            rewardsAvailable = 0,
            totalStakeAmount = 0;
        if (this.state.pools) {
            this.state.pools.map(pool => {
                const toSyxAmount =
                    (parseFloat(pool.stakeAmount) * parseFloat(pool.BPTPrice)) /
                    parseFloat(pool.price);
                rewardApr += parseFloat(pool.rewardApr) * toSyxAmount;
                rewardsAvailable += parseFloat(pool.rewardsAvailable);
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
                {this.state.showAlert ? (
                    <Alert
                        severity="warning"
                        onClose={() => this.setState({showAlert: false})}
                        className={classes.customAlert}
                    >
                        <FormattedMessage id="RISK_WARNING" />
                    </Alert>
                ) : (
                    <></>
                )}

                <Header
                    show={true}
                    address={address}
                    overlayClicked={this.overlayClicked}
                    cur_language={this.props.cur_language}
                    linkTo={"/"}
                    cur_language={this.props.cur_language}
                    setLanguage={this.props.setLanguage}
                />
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
                                                <FormattedMessage id="TOTAL_STAKING_APR" />
                                            </Typography>
                                            <Typography
                                                className={
                                                    classes.paperTitleSecondary
                                                }
                                                gutterBottom
                                            >
                                                {rewardApr ? rewardApr : "-"}
                                                <span> %</span>
                                            </Typography>
                                            {hasJoinedCount === 0 ? (
                                                <Button
                                                    variant="contained"
                                                    className={
                                                        classes.buttonSecondary
                                                    }
                                                    style={{marginTop: "9px"}}
                                                    disabled={loading}
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
                                                        hasJoinedCount == 0 ||
                                                        loading
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
                                                {rewardsAvailable
                                                    ? rewardsAvailable
                                                    : "-"}{" "}
                                                <span>SYX</span>
                                            </Typography>
                                            <Button
                                                style={{marginTop: "9px"}}
                                                className={
                                                    classes.buttonSecondary
                                                }
                                                variant="contained"
                                                disabled={
                                                    hasJoinedCount == 0 ||
                                                    loading
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
                                <FormattedMessage id="TOTAL_STAKING_APR" />
                                <span>{rewardApr ? rewardApr : "-"}%</span>
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
                                                {rewardsAvailable
                                                    ? rewardsAvailable
                                                    : "-"}{" "}
                                                <span>SYX</span>
                                            </Typography>
                                            <Button
                                                style={{marginTop: "9px"}}
                                                className={
                                                    classes.buttonSecondary
                                                }
                                                variant="contained"
                                                disabled={
                                                    hasJoinedCount == 0 ||
                                                    loading
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
                                    loading={loading}
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
                                        {this.state.pools ? (
                                            this.state.pools.map((pool, i) => {
                                                if (pool.type !== "seed") {
                                                    return (
                                                        <tr
                                                            key={i}
                                                            className={
                                                                classes.tableBody
                                                            }
                                                        >
                                                            <td>
                                                                {pool.stakeAmount >
                                                                0.0001 ? (
                                                                    <div
                                                                        className={
                                                                            "hold-left"
                                                                        }
                                                                    >
                                                                        <FormattedMessage id="HOLD" />
                                                                    </div>
                                                                ) : (
                                                                    <></>
                                                                )}
                                                                <img
                                                                    className={
                                                                        classes.icon
                                                                    }
                                                                    src={
                                                                        "/" +
                                                                        pool.name +
                                                                        ".png"
                                                                    }
                                                                    style={{
                                                                        marginRight:
                                                                            "-2px"
                                                                    }}
                                                                    alt=""
                                                                />
                                                                <img
                                                                    className={
                                                                        classes.icon
                                                                    }
                                                                    src={
                                                                        "/SYX.png"
                                                                    }
                                                                    alt=""
                                                                />
                                                                {pool.id}
                                                            </td>
                                                            <td>
                                                                {parseFloat(
                                                                    pool.price
                                                                ).toFixed(4)}
                                                                {pool.name}
                                                            </td>
                                                            <td>
                                                                {pool.totalSupply >
                                                                0
                                                                    ? (
                                                                          (parseFloat(
                                                                              pool.stakeAmount
                                                                          ) /
                                                                              parseFloat(
                                                                                  pool.totalSupply
                                                                              )) *
                                                                          100
                                                                      ).toFixed(
                                                                          2
                                                                      )
                                                                    : "0.00"}{" "}
                                                                %
                                                            </td>
                                                            <td>
                                                                <div>
                                                                    {
                                                                        pool.weight
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
                                                                        loading
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
                                        {this.state.pools ? (
                                            this.state.pools.map((pool, i) => {
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
                                                                    {pool.stakeAmount >
                                                                    0.0001 ? (
                                                                        <div
                                                                            className={
                                                                                "hold-left"
                                                                            }
                                                                        >
                                                                            <FormattedMessage id="HOLD" />
                                                                        </div>
                                                                    ) : (
                                                                        <></>
                                                                    )}
                                                                    <img
                                                                        className={
                                                                            classes.icon
                                                                        }
                                                                        src={
                                                                            "/" +
                                                                            pool.name +
                                                                            ".png"
                                                                        }
                                                                        style={{
                                                                            marginRight:
                                                                                "-2px"
                                                                        }}
                                                                        alt=""
                                                                    />
                                                                    <img
                                                                        className={
                                                                            classes.icon
                                                                        }
                                                                        src={
                                                                            "/SYX.png"
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
                                                                            pool.id
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    {parseFloat(
                                                                        pool.price
                                                                    ).toFixed(
                                                                        4
                                                                    )}
                                                                    <div
                                                                        style={{
                                                                            color:
                                                                                "#a4a7be"
                                                                        }}
                                                                    >
                                                                        {
                                                                            pool.name
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
                                                                            loading
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
                                                                            pool.name
                                                                        }
                                                                        :
                                                                        <span
                                                                            style={{
                                                                                color:
                                                                                    "#1E304B",
                                                                                paddingLeft:
                                                                                    "5px"
                                                                            }}
                                                                        >
                                                                            {parseFloat(
                                                                                pool.bptVlxBalance
                                                                            ).toFixed(
                                                                                4
                                                                            )}
                                                                        </span>
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
                                                                            0
                                                                                ? (
                                                                                      (parseFloat(
                                                                                          pool.stakeAmount
                                                                                      ) /
                                                                                          parseFloat(
                                                                                              pool.totalSupply
                                                                                          )) *
                                                                                      100
                                                                                  ).toFixed(
                                                                                      2
                                                                                  )
                                                                                : "0.00"}{" "}
                                                                            %
                                                                        </span>
                                                                    </Grid>
                                                                    <Grid
                                                                        item
                                                                        xs={6}
                                                                    >
                                                                        {
                                                                            pool.rewardsSymbol
                                                                        }
                                                                        :
                                                                        <span
                                                                            style={{
                                                                                color:
                                                                                    "#1E304B",
                                                                                paddingLeft:
                                                                                    "5px"
                                                                            }}
                                                                        >
                                                                            {parseFloat(
                                                                                pool.bptSyxBalance
                                                                            ).toFixed(
                                                                                4
                                                                            )}
                                                                        </span>
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
                                                                                pool.weight
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
                {modalOpen && this.renderModal()}
                {depositModalOpen &&
                    this.renderDepositModal(this.state.depositData)}
                {withdrawRewardsModalOpen &&
                    this.renderWithdrawRewardsModal(this.state.pools)}
                {transactionModalOpen &&
                    this.renderTransactionModal(this.state.tradeData)}
                {this.state.networkId &&
                    this.state.networkId != config.requiredNetworkId &&
                    this.renderNetworkErrModal()}
                {snackbarMessage && this.renderSnackbar()}

                {loading && <Loader />}
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
            loading: true
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
        this.setState({loading: true});
    };

    hideLoading = () => {
        this.setState({
            loading: false
        });
    };

    createEntryContract = data => {
        const {account} = this.state;
        if (
            !Object.getOwnPropertyNames(account).length ||
            account.address === undefined
        ) {
            this.setState(() => ({
                modalOpen: true
            }));
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
        this.setState({loading: false});
        const that = this;
        setTimeout(() => {
            const snackbarObj = {
                snackbarMessage: error.toString(),
                snackbarType: "Error"
            };
            that.setState(snackbarObj);
        });
    };

    getBalancesReturned = () => {
        const oldPools = this.state.pools;
        const pools = store.getStore("rewardPools");
        //The loading is hidden when the data is requested for the first time, and will not be hidden later, so as not to affect the loading displayed by the transaction
        if (!oldPools && pools) {
            this.setState({
                loading: false,
                pools
            });
        } else {
            this.setState({
                pools
            });
        }

        window.setTimeout(() => {
            dispatcher.dispatch({type: GET_BALANCES_PERPETUAL, content: {}});
        }, 15000);
    };

    overlayClicked = () => {
        this.setState({modalOpen: true});
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
            this.setState(() => ({
                modalOpen: true
            }));
        } else {
            this.setState({
                transactionModalOpen: true,
                tradeData: data
            });
        }
    };

    closeUnlockModal = () => {
        this.setState({modalOpen: false});
    };

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

    renderModal = () => {
        return (
            <UnlockModal
                closeModal={this.closeUnlockModal}
                modalOpen={this.state.modalOpen}
            />
        );
    };

    renderDepositModal = data => {
        return (
            <DepositModal
                data={data}
                loading={this.state.loading}
                closeModal={this.closeDepositModal}
                modalOpen={this.state.depositModalOpen}
            />
        );
    };

    renderWithdrawRewardsModal = data => {
        return (
            <WithdrawRewardsModal
                data={data}
                loading={this.state.loading}
                closeModal={this.closeWithdrawRewardsModal}
                modalOpen={this.state.withdrawRewardsModalOpen}
            />
        );
    };

    renderTransactionModal = data => {
        return (
            <TransactionModal
                data={data}
                loading={this.state.loading}
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
