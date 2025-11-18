import { baseApi } from "../../api/baseApi";

const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create task
    createTask: builder.mutation({
      query: (taskData) => ({
        url: "/tasks",
        method: "POST",
        body: taskData,
      }),
      invalidatesTags: ["Tasks", "Teams"],
    }),

    // Get all tasks with filters
    getAllTasks: builder.query({
      query: ({ projectId, memberId, status }: { projectId?: string; memberId?: string; status?: string } = {}) => {
        const params = new URLSearchParams();
        if (projectId) params.append("projectId", projectId);
        if (memberId) params.append("memberId", memberId);
        if (status) params.append("status", status);

        return {
          url: `/tasks?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Tasks"],
    }),

    // Get single task
    getTaskById: builder.query({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "GET",
      }),
      providesTags: ["Tasks"],
    }),

    // Update task
    updateTask: builder.mutation({
      query: ({ id, data }) => ({
        url: `/tasks/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Tasks", "Teams"],
    }),

    // Delete task
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks", "Teams"],
    }),

    // Auto-assign task
    autoAssignTask: builder.mutation({
      query: (teamId) => ({
        url: "/tasks/auto-assign",
        method: "POST",
        body: { teamId },
      }),
    }),

    // Reassign tasks
    reassignTasks: builder.mutation({
      query: (teamId) => ({
        url: "/tasks/reassign",
        method: "POST",
        body: { teamId },
      }),
      invalidatesTags: ["Tasks", "Teams", "ActivityLogs"],
    }),
  }),
});

export const {
  useCreateTaskMutation,
  useGetAllTasksQuery,
  useGetTaskByIdQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useAutoAssignTaskMutation,
  useReassignTasksMutation,
} = tasksApi;