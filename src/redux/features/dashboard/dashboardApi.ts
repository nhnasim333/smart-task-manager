import { baseApi } from "../../api/baseApi";

const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get dashboard statistics
    getDashboardStats: builder.query({
      query: () => ({
        url: "/dashboard/stats",
        method: "GET",
      }),
      providesTags: ["Dashboard", "Projects", "Tasks", "Teams"],
    }),

    // Get activity logs
    getActivityLogs: builder.query({
      query: ({ teamId, limit = 10 }) => {
        const params = new URLSearchParams();
        if (teamId) params.append("teamId", teamId);
        params.append("limit", limit.toString());

        return {
          url: `/activity-logs?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["ActivityLogs"],
    }),
  }),
});

export const { useGetDashboardStatsQuery, useGetActivityLogsQuery } =
  dashboardApi;