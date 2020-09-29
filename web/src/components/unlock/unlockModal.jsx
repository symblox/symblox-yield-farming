import React, {Component} from "react";
import {DialogContent, Dialog} from "@material-ui/core";

import Unlock from "./unlock.jsx";

class UnlockModal extends Component {
    render() {
        const {closeModal, modalOpen} = this.props;

        const fullScreen = window.innerWidth < 450;

        return (
            <Dialog
                open={modalOpen}
                onClose={closeModal}
                fullWidth={true}
                maxWidth={"sm"}
                fullScreen={fullScreen}
            >
                <DialogContent>
                    <Unlock closeModal={closeModal} />
                </DialogContent>
            </Dialog>
        );
    }
}
export default UnlockModal;
