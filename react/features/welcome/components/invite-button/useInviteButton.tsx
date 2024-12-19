import { SelectChangeEvent } from "@mui/material/Select";
import React, { useEffect, useReducer, useState } from "react";
import baseApi, { encodeFilter } from "../../../../api/axios";

interface IToggled {
    userModel: boolean;
    guestModel: boolean;
}

type Action = { type: "TOGGLE_USER" } | { type: "TOGGLE_GUEST" };

function reducer(state: IToggled, action: Action): IToggled {
    switch (action.type) {
        case "TOGGLE_USER":
            return { ...state, userModel: !state.userModel };
        case "TOGGLE_GUEST":
            return { ...state, guestModel: !state.guestModel };
        default:
            return state;
    }
}

const useInviteButton = () => {
    const [state, dispatch] = useReducer(reducer, {
        userModel: false,
        guestModel: false,
    });

    const [field, setField] = useState<string[]>([""]);

    const [personName, setPersonName] = useState<string[]>([]);

    const [emailOfUsers, setEmailOfUsers] = useState<string[]>([]);

    const handleChange = (event: SelectChangeEvent<typeof personName>) => {
        const {
            target: { value },
        } = event;
        setPersonName(typeof value === "string" ? value.split(",") : value);
    };

    const deleteFieldHandler = (index: number) => {
        const temp = [...field];
        temp.splice(index, 1);
        setField(temp);
    };
    const addFieldHandler = () => {
        const temp = [...field];
        temp.push("");
        setField(temp);
    };

    const changeHandler = (index: number, value: string) => {
        const temp = [...field];
        temp[index] = value;
        setField(temp);
    };

    const handleDelete = (index: number) => {
        const temp = [...personName];
        temp.splice(index, 1);
        setPersonName(temp);
    };

    const fetchDataWithFilter = async (endpoint: string, filter: object, page: number, limit: number) => {
        const query = `filter=${encodeFilter(filter)}&page=${page}&limit=${limit}`;
        const url = `${endpoint}?${query}`;

        try {
            const response = await baseApi.get(url);
            return response.data;
        } catch (error) {
            console.error("Error fetching data with filter:", error);
            throw error;
        }
    };

    const getUsers = async () => {
        const hash = window.location.hash;
        const hashParams = new URLSearchParams(hash.substring(1)); // Remove the '#' and parse

        // Extract the 'userInfo.email' parameter
        const emailUser = decodeURIComponent(hashParams.get("userInfo.email") || "").replace(/^"|"$/g, "");

        // Decode the email if necessary

        const filter = {
            where: [],
            page: 1,
            limit: 10,
            order_by: { by: "created_at", order: "DESC" },
        };

        try {
            const data = await fetchDataWithFilter("user/mini-page", filter, 1, 10);

            const emails = data.data.map((obj) => obj.email).filter((email) => email !== emailUser);
            setEmailOfUsers(emails);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        getUsers();
    }, []);

    return {
        userModel: state.userModel,
        guestModel: state.guestModel,
        field,
        personName,
        emailOfUsers,
        toggleUser: () => {
            dispatch({ type: "TOGGLE_USER" }), setPersonName([]), setField([""]);
        },
        deleteField: deleteFieldHandler,
        addField: addFieldHandler,
        changeField: changeHandler,
        selectChange: handleChange,
        handleDelete,
    };
};

export default useInviteButton;
