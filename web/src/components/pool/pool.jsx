import React from "react";
import {FormattedMessage} from "react-intl";
import {makeStyles} from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import holdIcon from "../../assets/hold.png";

const useStyles = makeStyles({
    root: {
        // minWidth: 373,
        borderRadius: "12px",
        textAlign: "center",
        fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: "300",
        fontSize: "20px",
        lineHeight: "28px",
        color: "#ACAEBC",
        boxShadow: "0px 0px 35px 0px rgba(94, 85, 126, 0.15)",
        height: "100%"
    },
    featuredRoot: {
        borderRadius: "12px",
        textAlign: "center",
        fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: "300",
        fontSize: "20px",
        lineHeight: "28px",
        color: "#FFFFFF",
        background:
            "linear-gradient(130.49deg, #253C5C 0%, #051731 93.26%, #253C5C)",
        mixBlendMode: "normal",
        boxShadow: "0px 0px 35px 0px rgba(94, 85, 126, 0.15)"
    },
    icon: {
        width: "36px",
        height: "36px",
        marginTop: "-6px",
        marginRight: "8px"
    },
    iconSecondary: {
        width: "51px",
        height: "24px",
        marginLeft: "8px"
    },
    title: {
        paddingTop: "17px",
        fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: "28px",
        lineHeight: "34px",
        color: props =>
            props.data && props.data.featured ? "#FFFFFF" : "#1E304B"
    },
    text: {
        paddingTop: "26px",
        fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: "46px",
        lineHeight: "56px",
        color: "#36B685"
    },
    textSecondary: {
        paddingTop: "8px"
    },
    textThird: {
        paddingTop: "34px"
    },
    textThirdColor: {
        color: props =>
            props.data && props.data.featured ? "#FFFFFF" : "#1E304B"
    },
    button: {
        background:
            "linear-gradient(135deg, #42D9FE 0%, #2872FA 100%, #42D9FE)",
        borderRadius: "26px",
        fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: "20px",
        color: "#FFFFFF",
        margin: "24px",
        minWidth: "213px",
        "&:hover": {
            background:
                "linear-gradient(315deg, #4DB5FF 0%, #57E2FF 100%, #4DB5FF)"
        }
    },
    buttonSecondary: {
        background:
            "linear-gradient(135deg, #FF3A33 0%, #FC06C6 100%, #FF3A33)",
        borderRadius: "26px",
        fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: "20px",
        color: "#FFFFFF",
        margin: "20px",
        minWidth: "213px",
        "&:hover": {
            background:
                "linear-gradient(315deg, #FF3A33 0%, #FC06C6 100%, #FF3A33)"
        }
    },
    bar: {
        textAlign: "center",
        display: "block"
    }
});

export default function Pool(props) {
    const classes = useStyles(props);
    const {data, onDeposit, onJoin} = props;

    const tokenIcon = "/" + data.name + ".png";

    return (
        <Card className={data.featured ? classes.featuredRoot : classes.root}>
            <CardContent>
                <Typography className={classes.title} gutterBottom>
                    <img className={classes.icon} src={tokenIcon} alt="" />
                    {data.id}
                    {/* {data.stakeAmount > 0.0001 ? (
                        <img
                            className={classes.iconSecondary}
                            src={holdIcon}
                            alt=""
                        />
                    ) : (
                        <></>
                    )} */}
                </Typography>
                <Typography className={classes.text}>
                    {data.rewardApr}%
                </Typography>
                <Typography className={classes.textSecondary}>
                    <FormattedMessage id="TOTAL_STAKING_APR" />
                </Typography>
                <Typography className={classes.textThird}>
                    <FormattedMessage id="TOTAL_SUPPLY" />:{" "}
                    <span className={classes.textThirdColor}>
                        {data.type == "seed"
                            ? parseFloat(data.totalSupply || 0).toFixed(4)
                            : (
                                  parseFloat(data.totalSupply || 0) *
                                  parseFloat(data.BPTPrice || 0)
                              ).toFixed(4)}
                        {data.name}
                    </span>
                </Typography>
                <Typography className={classes.textThird}>
                    <FormattedMessage id="WITHDRAWABLE_REWARDS" />:{" "}
                    <span className={classes.textThirdColor}>
                        {parseFloat(data.rewardsAvailable).toFixed(4)}{" "}
                        {data.rewardsSymbol}
                    </span>
                </Typography>
            </CardContent>
            <CardActions className={classes.bar}>
                {data.entryContractAddress ? (
                    <Button
                        size="small"
                        className={classes.button}
                        onClick={onDeposit}
                    >
                        <FormattedMessage id="LP_DEPOSIT" />
                    </Button>
                ) : (
                    <Button
                        size="small"
                        className={classes.buttonSecondary}
                        onClick={onJoin}
                    >
                        <FormattedMessage id="JOIN" />
                    </Button>
                )}
            </CardActions>
        </Card>
    );
}
