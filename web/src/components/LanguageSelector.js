import React, {useContext} from "react";

import {Select, Button, Menu, MenuItem} from "@material-ui/core";

// add i18n.
import {LanguageContext} from "../contexts/LanguageContext";
import {languageOptions} from "../constants/constants";

export const LanguageSelector = () => {
    const {language, setLanguage} = useContext(LanguageContext);
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (event, data) => {
        setLanguage(data);

        setAnchorEl(null);
    };

    const selectOptions = languageOptions.map(data => {
        return (
            <MenuItem
                key={data.key}
                onClick={event => handleMenuItemClick(event, data)}
            >
                {data.value}
            </MenuItem>
        );
    });
    return (
        <div className={"header__menu_wallet"} style={{width: "60px"}}>
            <Button
                aria-controls="lang-menu"
                aria-haspopup="true"
                onClick={handleClick}
            >
                {language.value}
            </Button>
            <Menu
                id="lang-menu"
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center"
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center"
                }}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {selectOptions}
            </Menu>
        </div>
    );
};
