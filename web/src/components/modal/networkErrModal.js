import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import {FormattedMessage} from "react-intl";
import config from "../../config";

export default function NetworkErrModal() {
    const [open, setOpen] = React.useState(true);

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <FormattedMessage id="NETWORK_ERROR" values={{
                            requiredNetwork: config.requiredNetwork,
                            rpcUrl: config.rpcUrl
                        }}/>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" autoFocus>
                        <FormattedMessage id="POPUP_ACTION_CONFIRM" />
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
