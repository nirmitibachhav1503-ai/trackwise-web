import api from "../api/axios";

const profileService = {

  getProfile: () =>
    api.get(
      "/profile"
    ),

  updateProfile: (
    data: any
  ) =>
    api.put(
      "/profile",
      data
    ),

  changePassword: (
    data: {
      oldPassword: string;
      newPassword: string;
    }
  ) =>
    api.post(
      "/api/profile/change-password",
      data
    ),

  uploadPhoto: (
    formData: FormData
  ) =>
    api.post(
      "/api/profile/upload-photo",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data"
        }
      }
    )
};

export default profileService;
