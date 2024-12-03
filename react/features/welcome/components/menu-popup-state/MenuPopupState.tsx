import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import CallIcon from "@mui/icons-material/Call";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import baseApi from "../../../../api/axios";


interface IMenuPopupState {
    startMeting: () => void;
}

function MenuPopupState({ startMeting }: IMenuPopupState) {
    return (
        <PopupState variant="popover" popupId="demo-popup-menu">
            {(popupState) => (
                <React.Fragment>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "#2badb2",
                            textTransform: "none",
                            "&:hover": {

                                backgroundColor: "#249c9a", // Optional: darker shade for hover

                            },
                        }}
                        {...bindTrigger(popupState)}
                    >
                        New meeting
                    </Button>
                    <Menu {...bindMenu(popupState)}>
                        <MenuItem
                            onClick={startMeting}
                            sx={{ display: "flex", alignItems: "center", gap: "7px" }}
                            className="flex-item"
                        >
                            <CallIcon sx={{ color: "#2badb2" }} /> Start an instant meeting
                        </MenuItem>
                        <MenuItem
                            onClick={popupState.close}
                            sx={{ display: "flex", alignItems: "center", gap: "7px" }}
                            className="flex-item"
                        >
                            <CalendarTodayIcon sx={{ color: "#2badb2" }} /> Schedule a meeting calendar
                        </MenuItem>
                    </Menu>
                </React.Fragment>
            )}
        </PopupState>
    );
}

export default MenuPopupState;
