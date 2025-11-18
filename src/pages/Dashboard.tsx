/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGetDashboardStatsQuery } from "@/redux/features/dashboard/dashboardApi";
import { useReassignTasksMutation } from "@/redux/features/tasks/tasksApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  FolderKanban,
  ListTodo,
  Users,
  ArrowRightLeft,
} from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Dashboard = () => {
  const { data: stats, isLoading } = useGetDashboardStatsQuery(undefined);
  const [reassignTasks] = useReassignTasksMutation();
  const [selectedTeamId, setSelectedTeamId] = useState("");

  const handleReassign = async () => {
    if (!selectedTeamId) {
      toast.error("Please select a team first");
      return;
    }

    const toastId = toast.loading("Reassigning tasks...");
    try {
      const res = await reassignTasks(selectedTeamId).unwrap();
      toast.success(res.message || "Tasks reassigned successfully", {
        id: toastId,
      });
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Failed to reassign tasks",
        {
          id: toastId,
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Overview of your task management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalProjects || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTasks || 0}</div>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="text-yellow-600">
                Pending: {stats?.pendingTasks || 0}
              </span>
              <span className="text-blue-600">
                In Progress: {stats?.inProgressTasks || 0}
              </span>
              <span className="text-green-600">
                Done: {stats?.doneTasks || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Auto Reassignment
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select team to reassign" />
              </SelectTrigger>
              <SelectContent>
                {stats?.teams?.map((team: any) => (
                  <SelectItem key={team._id} value={team._id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleReassign} disabled={!selectedTeamId}>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Reassign Tasks
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Team Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Team Summary</CardTitle>
          <CardDescription>
            Current workload of all team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.teams?.length === 0 ? (
            <p className="text-sm text-gray-500">No teams created yet</p>
          ) : (
            <div className="space-y-4">
              {stats?.teams?.map((team: any) => (
                <div key={team._id} className="space-y-2">
                  <h3 className="font-semibold text-lg">{team.name}</h3>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {team.members?.map((member: any) => {
                      const isOverloaded =
                        member.currentTasks > member.capacity;
                      return (
                        <Card
                          key={member.id}
                          className={
                            isOverloaded ? "border-red-500 border-2" : ""
                          }
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-gray-500">
                                  {member.role}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  isOverloaded ? "destructive" : "default"
                                }
                              >
                                {member.currentTasks}/{member.capacity}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reassignments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reassignments</CardTitle>
          <CardDescription>Last 5 task reassignments</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentLogs?.length === 0 ? (
            <p className="text-sm text-gray-500">No recent reassignments</p>
          ) : (
            <div className="space-y-3">
              {stats?.recentLogs?.map((log: any) => (
                <div
                  key={log._id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{log.taskTitle}</p>
                    <p className="text-xs text-gray-500">
                      From{" "}
                      <span className="font-semibold">{log.fromMember}</span> to{" "}
                      <span className="font-semibold">{log.toMember}</span>
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
