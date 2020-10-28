import React from "react";
import {FormattedMessage} from "react-intl";
import {makeStyles} from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import NumberFormat from 'react-number-format';

const useStyles = makeStyles({
    root: {
        position: "relative",
        borderRadius: "12px",
        textAlign: "center",
        fontStyle: "normal",
        fontWeight: "300",
        fontSize: "20px",
        lineHeight: "28px",
        color: "#ACAEBC",
        boxShadow: "0px 0px 35px 0px rgba(94, 85, 126, 0.15)",
        height: "380px"
    },
    featuredRoot: {
        position: "relative",
        borderRadius: "12px",
        textAlign: "center",
        fontStyle: "normal",
        fontWeight: "300",
        fontSize: "20px",
        lineHeight: "28px",
        color: "#FFFFFF",
        background:
            "linear-gradient(124.56deg, #E71E85 -27.83%, #2148D3 55.48%, #2148D3)",
        mixBlendMode: "normal",
        boxShadow: "0px 0px 35px 0px rgba(94, 85, 126, 0.15)",
        height: "380px",
        "&::after": {
            // content: "''",
            // backgroundImage: "url('/bg_pool.svg')",
            // backgroundSize: "auto",
            // backgroundRepeat: "no-repeat",
            // padding: "100%",
            // pointerEvents: "none"
        }
    },
    icon: {
        width: "48px",
        height: "48px",
        position: "relative"
    },
    iconSecondary: {
        width: "51px",
        height: "24px",
        marginLeft: "8px"
    },
    title: {
        paddingTop: "17px",
        fontFamily: "Oswald",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: "28px",
        lineHeight: "34px",
        opacity: "1 !important",
        color: props =>
            props.data && props.data.featured ? "#FFFFFF" : "#1E304B",
        "& span": {display: "inline-block", verticalAlign: "top"}
    },
    text: {
        fontStyle: "normal",
        fontSize: "20px",
        lineHeight: "20px",
        color: "#ACAEBC",
        opacity: "1 !important"
    },
    featuredText: {
        fontStyle: "normal",
        fontSize: "20px",
        lineHeight: "20px",
        color: "white",
        opacity: "1 !important"
    },
    textSecondary: {
        fontSize: "18px",
        paddingTop: "24px",
        textAlign: "left"
    },
    textThird: {
        fontSize: "18px",
        paddingTop: "8px",
        textAlign: "left"
    },
    textSecondaryColor: {
        color: "#36B685"
    },
    textThirdColor: {
        color: props =>
            props.data && props.data.featured ? "#FFFFFF" : "#1E304B"
    },
    tooltip: {
        fontSize: "16px",
        margin: "8px 0"
    },
    button: {
        background:
            "linear-gradient(135deg, #42D9FE 0%, #2872FA 100%, #42D9FE)",
        borderRadius: "26px",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: "20px",
        color: "#FFFFFF",
        margin: "12px 24px 24px 24px",
        minWidth: "213px",
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
            "linear-gradient(315deg, #FF3A33 0%, #FC06C6 100%, #FF3A33)",
        borderRadius: "26px",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: "20px",
        color: "#FFFFFF",
        margin: "12px 24px 24px 24px",
        minWidth: "213px",
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
    bar: {
        textAlign: "center",
        display: "block"
    }
});

export default function Pool(props) {
    const classes = useStyles(props);
    const {data, loading, onDeposit, onJoin} = props;

    const tokenIcon = "/" + data.name + ".png";

    return (
        <Card className={data.featured ? classes.featuredRoot : classes.root}>
            <CardContent>
                {data.stakeAmount > 0.0001 ? (
                    <div className={"hold-right"}>
                        <FormattedMessage id="HOLD" />
                    </div>
                ) : (
                    <></>
                )}
                <div className={classes.title}>
                    {data.type === "seed" ? (
                        <img className={classes.icon} src={tokenIcon} alt="" />
                    ) : (
                        <>
                            <img
                                className={classes.icon}
                                style={{marginRight: "-4px",zIndex: 2}}
                                src={"/SYX.png"}
                                alt=""
                            />
                            <img
                                className={classes.icon}
                                src={tokenIcon}
                                alt=""
                            />
                        </>
                    )}
                    <div style={{padding: "8px 0 8px"}}>{data.id}</div>
                </div>
                <Tooltip
                    title={
                        <React.Fragment>
                            <div className={classes.tooltip}>
                                <FormattedMessage id="TOTAL_SUPPLY" />: {' '}                            
                                    {data.type === "seed"?
                                        <NumberFormat value={data.totalSupply} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} suffix={'VLX'} decimalScale={4} fixedDecimalScale={true} />
                                    :
                                    <>
                                        <NumberFormat value={data.bptVlxBalance} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} suffix={data.name} decimalScale={4} fixedDecimalScale={true} />
                                        <NumberFormat value={data.bptSyxBalance} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} suffix={"SYX"} decimalScale={4} fixedDecimalScale={true} renderText={value => <div style={{margin:"10px 0 0 95px"}}>{value}</div>}/>
                                    </>
                                    }
                            </div>
                            <div className={classes.tooltip}>
                                <FormattedMessage id="REWARD_DISTRIBUTION_RATIO" />
                                :{" "}
                                <NumberFormat value={parseFloat(data.allocPoint) * 100} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} suffix={'%'} decimalScale={2} fixedDecimalScale={true} />
                            </div>
                        </React.Fragment>
                    }
                    enterTouchDelay={700}
                >
                    <Typography
                        className={
                            data.featured ? classes.featuredText : classes.text
                        }
                    >
                        <FormattedMessage id="SEE_DETAIL" />
                    </Typography>
                </Tooltip>

                <Typography className={classes.textSecondary}>
                    <FormattedMessage id="TOTAL_STAKING_APR" />:{" "}
                    <NumberFormat value={data.rewardApr} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} suffix={"%"} decimalScale={1} fixedDecimalScale={true} renderText={value => <span className={classes.textSecondaryColor} style={{float: "right"}}>{value}</span>}/>
                </Typography>

                <Typography className={classes.textThird}>
                    <FormattedMessage id="WITHDRAWABLE_REWARDS" />:{" "}
                    <NumberFormat value={data.rewardsAvailable} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} suffix={data.rewardsSymbol} decimalScale={4} fixedDecimalScale={true} renderText={value => <span className={classes.textSecondaryColor} style={{float: "right"}}>{value}</span>}/>
                </Typography>
                <Typography className={classes.textThird}>
                    {data.type === "seed" ? (
                        <>
                            <FormattedMessage id="TOTAL_STAKE" />:
                            <NumberFormat value={data.stakeAmount} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} suffix={data.name} decimalScale={4} fixedDecimalScale={true} renderText={value => <span className={classes.textThirdColor} style={{float: "right"}}>{value}</span>}/>
                        </>
                    ) : (
                        <>
                            <FormattedMessage id="LP_MY_SHARE" />:
                            <NumberFormat value={(data.totalSupply > 0
                            ? (parseFloat(data.stakeAmount) / parseFloat(data.totalSupply)) * 100 : 0).toLocaleString(undefined, {maximumFractionDigits:10})} defaultValue={'-'} displayType={'text'} thousandSeparator={true} isNumericString={true} suffix={"%"} decimalScale={6} fixedDecimalScale={true} renderText={value => <span className={classes.textThirdColor} style={{float: "right"}}>{value}</span>}/>
                        </>
                    )}
                </Typography>
            </CardContent>
            <CardActions className={classes.bar}>
                {data.entryContractAddress ? (
                    <Button
                        variant="contained"
                        size="small"
                        className={classes.button}
                        disabled={loading}
                        onClick={onDeposit}
                    >
                        <FormattedMessage id="LP_DEPOSIT" />
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        size="small"
                        className={classes.buttonSecondary}
                        disabled={loading}
                        onClick={onJoin}
                    >
                        <FormattedMessage id="JOIN" />
                    </Button>
                )}
            </CardActions>
        </Card>
    );
}
