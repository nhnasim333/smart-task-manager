import { baseApi } from "../../api/baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (userInfo) => ({
        url: "/jwt",
        method: "POST",
        body: userInfo,
      }),
    }),
    getUserProfile: builder.query({
      query: (email) => ({
        url: `/users/profile?email=${email}`,
        method: "GET",
      }),
      providesTags: ["Users"],
    }),
    updateUserProfile: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} = authApi;