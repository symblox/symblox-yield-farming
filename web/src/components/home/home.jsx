import React, {Component} from "react";
import {withRouter, Link} from "react-router-dom";
import {withStyles} from "@material-ui/core/styles";
import {
    Button,
    Grid,
    Paper,
    Typography,
    Divider,
    Container,
    Hidden
} from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import {FormattedMessage} from "react-intl";
import Snackbar from "../snackbar";
import Header from "../header";
import Footer from "../footer";
import Pool from "../pool";
import Balance from "../balance";
import UnlockModal from "../unlock/unlockModal";
import DepositModal from "../modal/depositModal";
import TransactionModal from "../modal/transactionModal";
import WithdrawRewardsModal from "../modal/withdrawRewardsModal";

import Loader from "../loader";
import Store from "../../stores";
import "./home.scss";

import {injected} from "../../stores/connectors";

import {
    ERROR,
    WITHDRAW_RETURNED,
    DEPOSIT_RETURNED,
    TRADE_RETURNED,
    GET_REWARDS,
    GET_REWARDS_RETURNED,
    CONNECTION_CONNECTED,
    CONNECTION_DISCONNECTED,
    GET_BALANCES_PERPETUAL_RETURNED,
    GET_BALANCES_PERPETUAL,
    CREATE_ENTRY_CONTRACT
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
        fontWeight: "bold",
        fontSize: "60px",
        lineHeight: "70px",
        textAlign: "center",
        color: "#FFFFFF"
    },
    headerTitleSecondary: {
        fontStyle: "normal",
        fontWeight: "300",
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
            fontWeight: "500",
            fontSize: "20px",
            lineHeight: "24px",
            color: "#1E304B",
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
                "linear-gradient(315deg, #FF3A33 0%, #FC06C6 100%, #FF3A33)"
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
    banner: {
        marginBottom: "16px"
    },
    actions: {
        height: "79px",
        padding: "46px 36px",
        // fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: "18px",
        lineHeight: "25px",
        color: "#C0C1CE",
        overflowX: "scroll",
        overflowY: "hidden"
    },
    paperTitle: {
        // fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: "300",
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
    }
});

class Home extends Component {
    constructor(props) {
        super(props);
        const account = store.getStore("account");
        const rewardPools = store.getStore("rewardPools");
        this.state = {
            rewardPools,
            loading: !account,
            account: account,
            modalOpen: false,
            depositModalOpen: false,
            withdrawRewardsModalOpen: false,
            transactionModalOpen: false
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
        injected.isAuthorized().then(isAuthorized => {
            if (isAuthorized) {
                injected
                    .activate()
                    .then(a => {
                        store.setStore({
                            account: {address: a.account},
                            web3context: {library: {provider: a.provider}}
                        });
                        emitter.emit(CONNECTION_CONNECTED);
                        console.log(a);
                    })
                    .catch(e => {
                        console.log(e);
                    });
            }
        });
    }
    componentDidMount() {
        // metamask networkChange
        if (window.ethereum && window.ethereum.on) {
            window.ethereum.autoRefreshOnNetworkChange = false;
            window.ethereum.on("chainChanged", _chainId => {
                console.log("networkId: ", _chainId);
                if (window.sessionStorage.getItem("chainId") !== _chainId) {
                    window.sessionStorage.setItem("chainId", _chainId);
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
        }
        setTimeout(async () => {
            const {account} = this.state;
            //   console.log(account)
            if (
                !Object.getOwnPropertyNames(account).length ||
                account.address === undefined
            ) {
                this.setState(() => ({
                    modalOpen: true
                }));
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
    }

    connectionConnected = async () => {
        const {account} = this.state;
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
            rewardsAvailable = 0;
        if (this.state.pools) {
            this.state.pools.map(pool => {
                rewardApr += parseFloat(pool.rewardApr);
                rewardsAvailable += parseFloat(pool.rewardsAvailable);
            });

            rewardApr = (rewardApr / this.state.pools.length).toFixed(1);
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
                    <Typography className={classes.headerTitle} gutterBottom>
                        <FormattedMessage id="HOME_TITLE" />
                    </Typography>
                    <Typography
                        className={classes.headerTitleSecondary}
                        gutterBottom
                    >
                        <FormattedMessage id="HOME_SUBTITLE" />
                    </Typography>
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
                                        <Button
                                            className={classes.button}
                                            style={{marginTop: "9px"}}
                                            variant="contained"
                                            disabled={hasJoinedCount == 0}
                                            onClick={() =>
                                                this.openDepositModal(
                                                    rewardPools
                                                )
                                            }
                                        >
                                            <FormattedMessage id="DEPOSIT_INCENTIVE_PLAN" />
                                        </Button>

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
                                            className={classes.buttonSecondary}
                                            variant="contained"
                                            disabled={hasJoinedCount == 0}
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
                    <div className={classes.title}>
                        <FormattedMessage id="RP_LIST_TITLE" />
                    </div>
                    <Grid container spacing={3} className={classes.banner}>
                        {rewardPools.map((data, i) => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <Pool
                                    data={data}
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
                                                                  ).toFixed(2)
                                                                : "0.00"}{" "}
                                                            %
                                                        </td>
                                                        <td>
                                                            <div>
                                                                {pool.weight}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Button
                                                                className={
                                                                    classes.button
                                                                }
                                                                size="small"
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
                                                return <></>;
                                            }
                                        })
                                    ) : (
                                        <></>
                                    )}
                                </tbody>
                            </table>
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
            loading: false
        });
        const that = this;
        setTimeout(() => {
            const snackbarObj = {snackbarMessage: txHash, snackbarType: "Hash"};
            that.setState(snackbarObj);
        });
    };

    createEntryContract = data => {
        dispatcher.dispatch({
            type: CREATE_ENTRY_CONTRACT,
            content: {
                asset: data
            }
        });
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
        const pools = store.getStore("rewardPools");
        this.setState({
            pools
        });
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
        this.setState({
            transactionModalOpen: true,
            tradeData: data
        });
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
                closeModal={this.closeDepositModal}
                modalOpen={this.state.depositModalOpen}
            />
        );
    };

    renderWithdrawRewardsModal = data => {
        return (
            <WithdrawRewardsModal
                data={data}
                closeModal={this.closeWithdrawRewardsModal}
                modalOpen={this.state.withdrawRewardsModalOpen}
            />
        );
    };

    renderTransactionModal = data => {
        return (
            <TransactionModal
                data={data}
                closeModal={this.closeTransactionModal}
                modalOpen={this.state.transactionModalOpen}
            />
        );
    };
}

export default withRouter(withStyles(styles)(Home));
