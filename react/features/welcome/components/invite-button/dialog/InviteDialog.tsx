import React, { ReactNode, useState } from "react";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button"; // Ensure you import Button
import baseApi from "../../../../../api/axios";
import Divider from "@mui/material/Divider";

interface IInviteDialog {
    props: DialogProps;
    handleClose: () => void;
    children_1: ReactNode;
    children_2: ReactNode;
    number: number;
    createMeeting: (mails: string[]) => Promise<void>;
    spaceDeskUser: string[];
    guestUser: string[];
}

const InviteDialog = ({
    children_1,
    handleClose,
    number,
    props,
    createMeeting,
    children_2,
    spaceDeskUser,
    guestUser,
}: IInviteDialog) => {
    const [disabledButton, setDisabledButton] = useState<boolean>(false);
    const [checkFields, setCheckFields] = useState<boolean | undefined>(undefined);
    const inviteMeeting = async () => {
        setDisabledButton((prev) => (prev = true));

        const usersEmail: string[] = [...spaceDeskUser, ...guestUser]; // Combine the two arrays

        const check = usersEmail[0]?.length > 0;
        setCheckFields(check);

        try {
            if (check) {
                createMeeting(usersEmail);

                // const id = localStorage.getItem("id");
                // if (id) {
                //     const res = await baseApi.post(`meeting/${id}/invite`, {
                //         emails: usersEmail,
                //     });
                //     res.status === 200 && handleClose();
                // }
            }
        } catch (error) {
            console.error("Error during meeting creation:", error);
        } finally {
            setDisabledButton((prev) => (prev = false));
        }
    };

    return (
        <Dialog
            {...props}
            PaperProps={{
                ...props.PaperProps,
                style: { width: "600px" },
                onClick: (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation(),
            }}
            aria-describedby={`alert-dialog-description-${number}`} // Use a consistent, string-based ID
        >
            <DialogContent id={`alert-dialog-description-${number}`}>
                <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {children_1}

                        {children_2}
                    </div>
                    {typeof checkFields === "boolean" && !checkFields && (
                        <p
                            style={{ color: "red", marginTop: "12px", textAlign: "center" }}
                        >{`please add one email at least`}</p>
                    )}
                </>
            </DialogContent>

            <DialogActions>
                <Button style={{ textTransform: "none" }} onClick={handleClose}>
                    close
                </Button>
                <Button
                    style={{ textTransform: "none" }}
                    disabled={disabledButton}
                    variant="contained"
                    onClick={() => inviteMeeting()}
                >
                    Invite and start meeting
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InviteDialog;
