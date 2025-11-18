/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useGetAllTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useAutoAssignTaskMutation,
} from "@/redux/features/tasks/tasksApi";
import { useGetAllProjectsQuery } from "@/redux/features/projects/projectsApi";
import { useGetTeamByIdQuery } from "@/redux/features/team/teamApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  ListTodo,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Tasks = () => {
  const [searchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get("projectId");

  const [filterProjectId, setFilterProjectId] = useState(
    projectIdFromUrl || ""
  );
  const [filterMemberId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const { data: tasks, isLoading } = useGetAllTasksQuery({
    projectId: filterProjectId,
    memberId: filterMemberId,
    status: filterStatus,
  });
  const { data: projects } = useGetAllProjectsQuery(undefined);

  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [autoAssign] = useAutoAssignTaskMutation();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  // Form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(
    projectIdFromUrl || ""
  );
  const [selectedPriority, setSelectedPriority] = useState("Medium");
  const [selectedStatus, setSelectedStatus] = useState("Pending");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [showOverloadWarning, setShowOverloadWarning] = useState(false);
  const [overloadedMember, setOverloadedMember] = useState<any>(null);

  // Get team based on selected project
  const selectedProject = projects?.find(
    (p: any) => p._id === selectedProjectId
  );
  const { data: team } = useGetTeamByIdQuery(selectedProject?.teamId, {
    skip: !selectedProject?.teamId,
  });

  // Check if selected member is overloaded
  const checkMemberCapacity = (memberId: string) => {
    if (!team) return;
    const member = team.members?.find((m: any) => m.id === memberId);
    if (member && member.currentTasks >= member.capacity) {
      setShowOverloadWarning(true);
      setOverloadedMember(member);
    } else {
      setShowOverloadWarning(false);
      setOverloadedMember(null);
    }
  };

  const handleAutoAssign = async () => {
    if (!selectedProject?.teamId) {
      toast.error("Please select a project first");
      return;
    }

    try {
      const res: any = await autoAssign(selectedProject.teamId).unwrap();
      if (res.success) {
        setSelectedMemberId(res.suggestedMember.id);
        toast.success(`Auto-assigned to ${res.suggestedMember.name}`);
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to auto-assign");
    }
  };

  const resetForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setSelectedProjectId(projectIdFromUrl || "");
    setSelectedPriority("Medium");
    setSelectedStatus("Pending");
    setSelectedMemberId("");
    setShowOverloadWarning(false);
    setOverloadedMember(null);
  };

  const handleCreateTask = async (forceAssign = false) => {
    if (!taskTitle || !selectedProjectId) {
      toast.error("Please fill all required fields");
      return;
    }

    if (showOverloadWarning && !forceAssign) {
      return; // Wait for user to decide
    }

    const toastId = toast.loading("Creating task...");
    try {
      const member = team?.members?.find((m: any) => m.id === selectedMemberId);

      await createTask({
        title: taskTitle,
        description: taskDescription,
        projectId: selectedProjectId,
        teamId: selectedProject?.teamId,
        assignedMemberId: selectedMemberId || "Unassigned",
        assignedMemberName: member?.name || "Unassigned",
        priority: selectedPriority,
        status: selectedStatus,
      }).unwrap();

      toast.success("Task created successfully", { id: toastId });
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create task", {
        id: toastId,
      });
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setSelectedProjectId(task.projectId);
    setSelectedPriority(task.priority);
    setSelectedStatus(task.status);
    setSelectedMemberId(task.assignedMemberId);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!taskTitle || !selectedProjectId) {
      toast.error("Please fill all required fields");
      return;
    }

    const toastId = toast.loading("Updating task...");
    try {
      const member = team?.members?.find((m: any) => m.id === selectedMemberId);

      await updateTask({
        id: editingTask._id,
        data: {
          title: taskTitle,
          description: taskDescription,
          projectId: selectedProjectId,
          teamId: selectedProject?.teamId,
          assignedMemberId: selectedMemberId || "Unassigned",
          assignedMemberName: member?.name || "Unassigned",
          priority: selectedPriority,
          status: selectedStatus,
        },
      }).unwrap();

      toast.success("Task updated successfully", { id: toastId });
      setIsEditDialogOpen(false);
      resetForm();
      setEditingTask(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update task", {
        id: toastId,
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const toastId = toast.loading("Deleting task...");
    try {
      await deleteTask(taskId).unwrap();
      toast.success("Task deleted successfully", { id: toastId });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete task", {
        id: toastId,
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive";
      case "Medium":
        return "default";
      case "Low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-gray-500">Manage and assign tasks</p>
        </div>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task and assign it to a team member
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="taskTitle">Task Title *</Label>
                <Input
                  id="taskTitle"
                  placeholder="Design Homepage"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taskDescription">Description</Label>
                <Textarea
                  id="taskDescription"
                  placeholder="Task description..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectSelect">Project *</Label>
                  <Select
                    value={selectedProjectId}
                    onValueChange={setSelectedProjectId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects?.map((project: any) => (
                        <SelectItem key={project._id} value={project._id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prioritySelect">Priority</Label>
                  <Select
                    value={selectedPriority}
                    onValueChange={setSelectedPriority}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="memberSelect">Assign To</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAutoAssign}
                    disabled={!selectedProjectId}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Auto-assign
                  </Button>
                </div>
                <Select
                  value={selectedMemberId}
                  onValueChange={(value) => {
                    setSelectedMemberId(value);
                    checkMemberCapacity(value);
                  }}
                  disabled={!selectedProjectId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select member or leave unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                    {team?.members?.map((member: any) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.currentTasks}/{member.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showOverloadWarning && overloadedMember && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {overloadedMember.name} has {overloadedMember.currentTasks}{" "}
                    tasks but capacity is {overloadedMember.capacity}. Assign
                    anyway?
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              {showOverloadWarning ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMemberId("")}
                  >
                    Choose Another
                  </Button>
                  <Button onClick={() => handleCreateTask(true)}>
                    Assign Anyway
                  </Button>
                </div>
              ) : (
                <Button onClick={() => handleCreateTask()}>Create Task</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={filterProjectId} onValueChange={setFilterProjectId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All Projects</SelectItem>
              {projects?.map((project: any) => (
                <SelectItem key={project._id} value={project._id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tasks List */}
      {tasks?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ListTodo className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900">No tasks yet</p>
            <p className="text-sm text-gray-500">
              Create your first task to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tasks?.map((task: any) => (
            <Card key={task._id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <span
                      className={`text-xs px-2 py-1 rounded ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      Assigned to:{" "}
                      <span className="font-medium">
                        {task.assignedMemberName}
                      </span>
                    </span>
                    <span>•</span>
                    <span>
                      Project:{" "}
                      {projects?.find((p: any) => p._id === task.projectId)
                        ?.name || "Unknown"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditTask(task)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Task</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this task? This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteTask(task._id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            resetForm();
            setEditingTask(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editTaskTitle">Task Title *</Label>
              <Input
                id="editTaskTitle"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTaskDescription">Description</Label>
              <Textarea
                id="editTaskDescription"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editPrioritySelect">Priority</Label>
                <Select
                  value={selectedPriority}
                  onValueChange={setSelectedPriority}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStatusSelect">Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editMemberSelect">Assign To</Label>
              <Select
                value={selectedMemberId}
                onValueChange={setSelectedMemberId}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unassigned">Unassigned</SelectItem>
                  {team?.members?.map((member: any) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.currentTasks}/{member.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
                setEditingTask(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateTask}>Update Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;
