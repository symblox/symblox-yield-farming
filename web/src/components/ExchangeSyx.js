import React, {useContext, useEffect, useState} from "react";
import {parseEther, formatEther} from "@ethersproject/units";
import {withRouter} from "react-router-dom";
import NumberFormat from "react-number-format";
import {withStyles} from "@material-ui/core/styles";
import {FormattedMessage} from "react-intl";
import {
    Box,
    Button,
    FormControl,
    InputAdornment,
    OutlinedInput,
    Typography,
    Grid,
    Divider
} from "@material-ui/core";

import {PoolContext} from "../contexts/PoolContext";

const styles = theme => ({
    container: {
        textAlign: "center"
    },
    heroText: {
        color: "#FFFFFF",
        textAlign: "center",
        marginTop: "2rem",
        marginBottom: "4rem",
        [theme.breakpoints.down("xs")]: {
            display: "none"
        }
    },
    root: {
        background: "#FFFFFF",
        boxShadow: "0px 0px 35px 0px rgba(94, 85, 126, 0.15)",
        borderRadius: "12px",
        textAlign: "left",

        "& Button": {},
        "& p": {
            margin: "8px 0"
        }
    },

    title: {
        margin: "0 0 16px 0",
        textAlign: "left"
    },
    subTitle: {
        // margin: "8px 0",
        fontWeight: "500"
    },
    box: {
        width: "100%"
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
        width: "100%",
        margin: "26px auto 0 auto",
        "&:hover": {
            background:
                "linear-gradient(315deg, #4DB5FF 0%, #57E2FF 100%, #4DB5FF)"
        },
        "&.Mui-disabled": {
            background:
                "linear-gradient(135deg, rgb(66, 217, 254, 0.12) 0%, rgb(40, 114, 250,0.12) 100%, rgb(66, 217, 254, 0.12))",
            color: "#FFFFFF"
        }
    }
});

const ExchangeSyx = ({classes}) => {
    const {oldSyxBalance, oldSyxSupply, exchangeSyx} = useContext(PoolContext);
    const [amount, setAmount] = useState(0);

    const amountChange = event => {
        if (Number.isNaN(parseFloat(event.target.value))) {
            setAmount(0);
        } else {
            setAmount(event.target.value);
        }
    };

    const getMaxAmount = () => {
        setAmount(formatEther(oldSyxBalance));
    };

    return (
        <Box paddingX={2}>
            <Typography variant="h2" className={classes.heroText}>
                <FormattedMessage id="EXCHANGE_TITLE" />
            </Typography>
            <Box
                maxWidth="60rem"
                marginX="auto"
                marginY="2rem"
                p={6}
                className={classes.root}
            >
                <Grid container spacing={8}>
                    <Grid item xs={12} sm={8}>
                        <Typography variant="h6" className={classes.title}>
                            {" "}
                            <FormattedMessage id="EXCHANGE_SUB_TITLE" />
                        </Typography>
                        <FormControl variant="outlined" className={classes.box}>
                            <Typography>
                                <FormattedMessage id="EXCHANGE_TIP" />
                            </Typography>
                            <OutlinedInput
                                // className={classes.customInput}
                                id="outlined-adornment-password"
                                type={"text"}
                                value={amount}
                                onChange={amountChange}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <Button onClick={getMaxAmount}>
                                            <FormattedMessage id="POPUP_INPUT_MAX" />
                                        </Button>
                                    </InputAdornment>
                                }
                            />
                            <Typography variant="body2">
                                <FormattedMessage
                                    id="EXCHANGE_WALLET_BALANCE"
                                    values={{
                                        amount: (
                                            <NumberFormat
                                                value={formatEther(
                                                    oldSyxBalance
                                                )}
                                                defaultValue={"-"}
                                                displayType={"text"}
                                                thousandSeparator={true}
                                                isNumericString={true}
                                                suffix={" SYX"}
                                                decimalScale={4}
                                                fixedDecimalScale={true}
                                            />
                                        )
                                    }}
                                />
                            </Typography>
                        </FormControl>
                        <Button
                            className={classes.button}
                            onClick={() => exchangeSyx(parseEther(amount))}
                        >
                            <FormattedMessage id="EXCHANGE" />
                        </Button>
                    </Grid>
                    <Divider orientation="vertical" flexItem />
                    <Grid item xs={12} sm={3}>
                        <Typography className={classes.subTitle}>
                            <FormattedMessage id="EXCHANGE_RATE" />
                        </Typography>
                        <Typography>1:1</Typography>
                        <br />
                        <Typography className={classes.subTitle}>
                            <FormattedMessage id="EXCHANGE_TOTAL_SUPPLY" />
                        </Typography>
                        <Typography>
                            <NumberFormat
                                value={formatEther(oldSyxSupply)}
                                defaultValue={"-"}
                                displayType={"text"}
                                thousandSeparator={true}
                                isNumericString={true}
                                suffix={" SYX"}
                                decimalScale={4}
                                fixedDecimalScale={true}
                            />
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default withRouter(withStyles(styles)(ExchangeSyx));
