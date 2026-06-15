import { useEffect, useState } from "react";

import {
  Button,
  TextField,
  Avatar,
  CircularProgress
} from "@mui/material";

import profileService from "../../services/profileService";

import {
  showSuccess,
  showError
} from "../../utils/toast";

function Profile() {

  const [profile, setProfile] =
    useState<any>({});

  const [selectedImage,
    setSelectedImage]
    = useState<File | null>(null);

  const [previewImage,
    setPreviewImage]
    = useState("");

  const [loading,
    setLoading]
    = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile =
    async () => {

      try {

        const response =
          await profileService
            .getProfile();

        setProfile(
          response.data
        );

        setPreviewImage(
          response.data.profilePhoto
        );
      }
      catch {

        showError(
          "Unable To Load Profile"
        );
      }
    };

  const handleImageChange =
    (
      event:
      React.ChangeEvent<HTMLInputElement>
    ) => {

      if (
        !event.target.files ||
        event.target.files.length === 0
      ) {
        return;
      }

      const file =
        event.target.files[0];

      const allowedTypes =
        [
          "image/jpeg",
          "image/jpg",
          "image/png"
        ];

      if (
        !allowedTypes.includes(
          file.type
        )
      ) {

        showError(
          "Only JPG and PNG Images Allowed"
        );

        return;
      }

      if (
        file.size >
        2 * 1024 * 1024
      ) {

        showError(
          "Maximum 2MB File Allowed"
        );

        return;
      }

      setSelectedImage(
        file
      );

      setPreviewImage(
        URL.createObjectURL(
          file
        )
      );
    };

  const uploadProfilePhoto =
    async () => {

      if (!selectedImage) {

        showError(
          "Please Select Image"
        );

        return;
      }

      try {

        setLoading(true);

        const formData =
          new FormData();

        formData.append(
          "file",
          selectedImage
        );

        const response =
          await profileService
            .uploadPhoto(
              formData
            );

        setProfile({
          ...profile,
          profilePhoto:
            response.data.imageUrl
        });

        showSuccess(
          "Profile Photo Uploaded Successfully"
        );
      }
      catch {

        showError(
          "Upload Failed"
        );
      }
      finally {

        setLoading(false);
      }
    };

  const updateProfile =
    async () => {

      try {

        await profileService
          .updateProfile(
            profile
          );

        showSuccess(
          "Profile Updated Successfully"
        );
      }
      catch {

        showError(
          "Update Failed"
        );
      }
    };

  return (

    <div className="container">

      <h2>
        My Profile
      </h2>

      <div
        className="
        card
        shadow-sm
        border-0
        mt-4"
      >

        <div className="card-body">

          {/* Profile Photo */}

          <div
            className="
            text-center
            mb-4"
          >

            <Avatar

              src={
                previewImage
                  ? previewImage
                  : "/default-user.png"
              }

              sx={{
                width: 150,
                height: 150,
                margin: "auto"
              }}
            />

            <div className="mt-3">

              <input
                type="file"
                accept="
                image/png,
                image/jpeg,
                image/jpg"
                onChange={
                  handleImageChange
                }
              />

            </div>

            <Button
              variant="contained"
              sx={{
                mt: 2
              }}
              onClick={
                uploadProfilePhoto
              }
              disabled={
                loading
              }
            >

              {
                loading
                  ?
                  <CircularProgress
                    size={22}
                    color="inherit"
                  />
                  :
                  "Upload Photo"
              }

            </Button>

          </div>

          <hr />

          {/* Profile Details */}

          <TextField
            label="Employee Code"
            fullWidth
            margin="normal"
            disabled
            value={
              profile.employeeCode
              || ""
            }
          />

          <TextField
            label="Full Name"
            fullWidth
            margin="normal"
            value={
              profile.fullName
              || ""
            }
            onChange={(e) =>
              setProfile({
                ...profile,
                fullName:
                  e.target.value
              })
            }
          />

          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={
              profile.email
              || ""
            }
            onChange={(e) =>
              setProfile({
                ...profile,
                email:
                  e.target.value
              })
            }
          />

          <TextField
            label="Mobile Number"
            fullWidth
            margin="normal"
            value={
              profile.mobileNumber
              || ""
            }
            onChange={(e) =>
              setProfile({
                ...profile,
                mobileNumber:
                  e.target.value
              })
            }
          />

          <Button
            variant="contained"
            sx={{
              mt: 2
            }}
            onClick={
              updateProfile
            }
          >
            Update Profile
          </Button>

        </div>

      </div>

    </div>

  );
}

export default Profile;