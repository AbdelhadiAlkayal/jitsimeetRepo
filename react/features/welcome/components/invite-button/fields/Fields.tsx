import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import React from "react";
import Button from "@mui/material/Button";
interface IFields {
    fields: string[];
    deleteFieldHandler: (index: number) => void;
    addFieldHandler: () => void;
    changeHandler: (index: number, value: string) => void;
}

const Fields = ({ fields, addFieldHandler, changeHandler, deleteFieldHandler }: IFields) => {
    return (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: "5px" }}>
            <p style={{ marginBottom: "12px", fontWeight: "bold" }}>{`invite users as Guest`}</p>

            {fields.map((field, index) => (
                <Box
                    key={index}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                    }}
                >
                    <TextField
                        value={field}
                        type="email"
                        onChange={(e) => changeHandler(index, e.target.value)}
                        label={`Guest email ${index + 1}`}
                        variant="outlined"
                        sx={{ flexGrow: 1, marginRight: "8px" }}
                    />
                    <IconButton
                        disabled={fields.length === 1}
                        onClick={() => deleteFieldHandler(index)}
                        color="error"
                        aria-label="delete field"
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ))}
            <div style={{ textAlign: "end" }}>
                <Button onClick={addFieldHandler} variant="contained" startIcon={<AddIcon />}>
                    Add Email
                </Button>
            </div>
        </Box>
    );
};

export default Fields;
