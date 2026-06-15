import {
    useState
}
from "react";

import TextField
from "@mui/material/TextField";

import Button
from "@mui/material/Button";

import profileService
from "../../services/profileService";

import {
    showSuccess,
    showError
}
from "../../utils/toast";

function ChangePassword()
{
    const [oldPassword,
        setOldPassword]
        = useState("");

    const [newPassword,
        setNewPassword]
        = useState("");

    const changePassword =
        async () =>
    {
        try
        {
            await profileService
                .changePassword({
                    oldPassword,
                    newPassword
                });

            showSuccess(
                "Password Changed Successfully"
            );

            setOldPassword("");
            setNewPassword("");
        }
        catch
        {
            showError(
                "Password Change Failed"
            );
        }
    };

    return (

        <div>

            <h2>
                Change Password
            </h2>

            <div
                className="
                card
                p-4
                mt-4"
            >

                <TextField
                    label="Old Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={oldPassword}
                    onChange={(e)=>
                        setOldPassword(
                            e.target.value
                        )
                    }
                />

                <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={newPassword}
                    onChange={(e)=>
                        setNewPassword(
                            e.target.value
                        )
                    }
                />

                <Button
                    variant="contained"
                    onClick={
                        changePassword
                    }
                >
                    Change Password
                </Button>

            </div>

        </div>
    );
}

export default ChangePassword;