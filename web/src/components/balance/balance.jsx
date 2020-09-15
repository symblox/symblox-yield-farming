import React from "react";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles({
    root: {
        fontFamily: "Noto Sans SC",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: "20px",
        lineHeight: "24px",
        color: "#C0C1CE",
        marginLeft: "32px !important",

        "& img": {
            width: "24px",
            height: "24px",
            marginRight: "8px"
        },
        "& span": {
            color: "#454862",
            marginRight: "8px"
        }
    }
});

export default function Balance(props) {
    const classes = useStyles();
    const {name, balance} = props;

    const tokenIcon = "/" + name + ".png";

    return (
        <div className={classes.root}>
            <img src={tokenIcon} alt="" />
            <span>{parseFloat(balance).toFixed(4)}</span>
            {name}
        </div>
    );
}
