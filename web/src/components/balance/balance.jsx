import React from "react";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles({
    root: {
        display: "flex",
        fontFamily: "Oswald",
        fontSize: "20px",
        lineHeight: "24px",
        color: props => (props.outline ? "#C0C1CE" : "#C0C1CE"),
        marginRight: props => (props.outline ? "32px" : "0px"),
        marginLeft: props => (props.outline ? "0px" : "32px"),
        "& img": {
            width: "24px",
            height: "24px",
            marginRight: "8px",
            verticalAlign: "bottom"
        },
        "& span": {
            color: props => (props.outline ? "#FFFFFF" : "#454862"),
            marginRight: "8px"
        }
    }
});

export default function Balance(props) {
    const classes = useStyles(props);
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
