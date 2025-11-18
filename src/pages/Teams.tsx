/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  useGetAllTeamsQuery,
  useCreateTeamMutation,
  useDeleteTeamMutation,
  useAddMemberToTeamMutation,
  useDeleteTeamMemberMutation,
} from "@/redux/features/team/teamApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Users } from "lucide-react";
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

const Teams = () => {
  const { data: teams, isLoading } = useGetAllTeamsQuery(undefined);
  const [createTeam] = useCreateTeamMutation();
  const [deleteTeam] = useDeleteTeamMutation();
  const [addMember] = useAddMemberToTeamMutation();
  const [deleteMember] = useDeleteTeamMemberMutation();

  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  const [teamName, setTeamName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState("");
  const [memberCapacity, setMemberCapacity] = useState("5");

  const handleCreateTeam = async () => {
    if (!teamName) {
      toast.error("Please enter team name");
      return;
    }

    const toastId = toast.loading("Creating team...");
    try {
      await createTeam({ name: teamName, members: [] }).unwrap();
      toast.success("Team created successfully", { id: toastId });
      setIsTeamDialogOpen(false);
      setTeamName("");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create team", {
        id: toastId,
      });
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    const toastId = toast.loading("Deleting team...");
    try {
      await deleteTeam(teamId).unwrap();
      toast.success("Team deleted successfully", { id: toastId });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete team", {
        id: toastId,
      });
    }
  };

  const handleAddMember = async () => {
    if (!memberName || !memberRole) {
      toast.error("Please fill all fields");
      return;
    }

    const toastId = toast.loading("Adding member...");
    try {
      await addMember({
        teamId: selectedTeamId,
        memberData: {
          name: memberName,
          role: memberRole,
          capacity: parseInt(memberCapacity),
        },
      }).unwrap();
      toast.success("Member added successfully", { id: toastId });
      setIsMemberDialogOpen(false);
      setMemberName("");
      setMemberRole("");
      setMemberCapacity("5");
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Failed to add member",
        {
          id: toastId,
        }
      );
    }
  };

  const handleDeleteMember = async (teamId: string, memberId: string) => {
    const toastId = toast.loading("Removing member...");
    try {
      await deleteMember({ teamId, memberId }).unwrap();
      toast.success("Member removed successfully", { id: toastId });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to remove member", {
        id: toastId,
      });
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
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-gray-500">Manage your teams and members</p>
        </div>
        <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Add a new team to organize your projects
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  placeholder="Development Team"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsTeamDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateTeam}>Create Team</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teams Grid */}
      {teams?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900">No teams yet</p>
            <p className="text-sm text-gray-500">
              Create your first team to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams?.map((team: any) => (
            <Card key={team._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{team.name}</CardTitle>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Team</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this team? This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteTeam(team._id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <CardDescription>
                  {team.members?.length || 0} members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Members List */}
                <div className="space-y-2">
                  {team.members?.length === 0 ? (
                    <p className="text-sm text-gray-500">No members yet</p>
                  ) : (
                    team.members?.map((member: any) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-gray-500">
                            {member.role} • Capacity: {member.capacity}
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this member from
                                the team?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteMember(team._id, member.id)
                                }
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Member Button */}
                <Dialog
                  open={isMemberDialogOpen && selectedTeamId === team._id}
                  onOpenChange={(open) => {
                    setIsMemberDialogOpen(open);
                    if (open) setSelectedTeamId(team._id);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" size="sm">
                      <Plus className="mr-2 h-3 w-3" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Team Member</DialogTitle>
                      <DialogDescription>
                        Add a new member to {team.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="memberName">Name</Label>
                        <Input
                          id="memberName"
                          placeholder="John Doe"
                          value={memberName}
                          onChange={(e) => setMemberName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="memberRole">Role</Label>
                        <Input
                          id="memberRole"
                          placeholder="Developer"
                          value={memberRole}
                          onChange={(e) => setMemberRole(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="memberCapacity">
                          Capacity (0-10 tasks)
                        </Label>
                        <Input
                          id="memberCapacity"
                          type="number"
                          min="0"
                          max="10"
                          value={memberCapacity}
                          onChange={(e) => setMemberCapacity(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsMemberDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddMember}>Add Member</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Teams;
