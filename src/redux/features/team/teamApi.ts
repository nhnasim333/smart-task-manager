import { baseApi } from "../../api/baseApi";

const teamApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create team
    createTeam: builder.mutation({
      query: (teamData) => ({
        url: "/teams",
        method: "POST",
        body: teamData,
      }),
      invalidatesTags: ["Teams"],
    }),

    // Get all teams
    getAllTeams: builder.query({
      query: () => ({
        url: "/teams",
        method: "GET",
      }),
      providesTags: ["Teams"],
    }),

    // Get single team
    getTeamById: builder.query({
      query: (id) => ({
        url: `/teams/${id}`,
        method: "GET",
      }),
      providesTags: ["Teams"],
    }),

    // Update team
    updateTeam: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/teams/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Teams", "Dashboard"],
    }),

    // Delete team
    deleteTeam: builder.mutation({
      query: (id) => ({
        url: `/teams/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Teams", "Dashboard"],
    }),

    // Add member to team
    addMemberToTeam: builder.mutation({
      query: ({ teamId, ...memberData }) => ({
        url: `/teams/${teamId}/members`,
        method: "PATCH",
        body: memberData,
      }),
      invalidatesTags: ["Teams", "Dashboard"],
    }),

    // Update team member
    updateTeamMember: builder.mutation({
      query: ({ teamId, memberId, ...data }) => ({
        url: `/teams/${teamId}/members/${memberId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Teams", "Dashboard"],
    }),

    // Delete team member
    deleteTeamMember: builder.mutation({
      query: ({ teamId, memberId }) => ({
        url: `/teams/${teamId}/members/${memberId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Teams", "Tasks", "Dashboard"],
    }),
  }),
});

export const {
  useCreateTeamMutation,
  useGetAllTeamsQuery,
  useGetTeamByIdQuery,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useAddMemberToTeamMutation,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
} = teamApi;