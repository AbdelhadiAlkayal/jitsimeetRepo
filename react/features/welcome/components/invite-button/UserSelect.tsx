import { Theme, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import React from "react";

interface IUserSelect {
    emails: string[];
    personName: string[];
    selectChange: (event: SelectChangeEvent<string[]>) => void;
    handleDelete: (index: number) => void;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

function getStyles(name: string, personName: readonly string[], theme: Theme) {
    return {
        fontWeight: personName.includes(name) ? theme.typography.fontWeightMedium : theme.typography.fontWeightRegular,
    };
}

const UserSelect = ({ emails, personName, selectChange, handleDelete }: IUserSelect) => {
    const theme = useTheme();

    return (
        <div>
            <p style={{ marginBottom: "12px", fontWeight: "bold" }}>{`invite users from space desk`}</p>
            <FormControl sx={{ m: 1, width: "100%" }}>
                <InputLabel id="demo-multiple-chip-label">Choose</InputLabel>
                <Select
                    labelId="demo-multiple-chip-label"
                    id="demo-multiple-chip"
                    multiple
                    value={personName}
                    onChange={selectChange}
                    input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                    renderValue={(selected) => (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            {selected.map((value) => (
                                <Chip key={value} label={value} />
                            ))}
                        </Box>
                    )}
                    MenuProps={MenuProps}
                >
                    {emails.map((email) => (
                        <MenuItem key={email} value={email} style={getStyles(email, personName, theme)}>
                            {email}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
};

export default UserSelect;
