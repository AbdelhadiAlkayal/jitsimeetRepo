import React, { Fragment } from "react";

import Button from "@mui/material/Button";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import useInviteButton from "./useInviteButton";

import InviteDialog from "./dialog/InviteDialog";
import UserSelect from "./UserSelect";
import Fields from "./fields/Fields";

interface IInviteButton {
    createMeeting: () => Promise<void>;
}

const InviteButton = ({ createMeeting }: IInviteButton) => {
    const {
        toggleUser,
        userModel,
        emailOfUsers,
        personName,
        selectChange,
        field,
        addField,
        changeField,
        deleteField,
        handleDelete,
    } = useInviteButton();

    return (
        <Fragment>
            <Button
                onClick={() => toggleUser()}
                style={{ textTransform: "none" }}
                variant="contained"
                startIcon={<GroupAddIcon />}
            >
                Invite users
            </Button>
            {/* <Button
                onClick={() => toggleGuest()}
                style={{ textTransform: "none" }}
                variant="contained"
                startIcon={<PersonAddIcon />}
            >
                Invite guest
            </Button> */}

            {/* <InviteDialog
                props={{ open: guestModel }}
                handleClose={() => toggleGuest()}
                number={1}
                usersEmail={field}
                createMeeting={createMeeting}
            >
                <Fields
                    fields={field}
                    addFieldHandler={addField}
                    changeHandler={changeField}
                    deleteFieldHandler={deleteField}
                />
            </InviteDialog> */}
            <InviteDialog
                createMeeting={createMeeting}
                props={{
                    open: userModel,
                }}
                handleClose={() => toggleUser()}
                number={2}
                spaceDeskUser={personName}
                guestUser={field}
                children_1={
                    <UserSelect
                        handleDelete={handleDelete}
                        emails={emailOfUsers}
                        personName={personName}
                        selectChange={selectChange}
                    />
                }
                children_2={
                    <Fields
                        fields={field}
                        addFieldHandler={addField}
                        changeHandler={changeField}
                        deleteFieldHandler={deleteField}
                    />
                }
            />
        </Fragment>
    );
};

export default InviteButton;
