import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import SkillCard from '@/components/SkillCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Send, Users, BookOpen, Bell, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [notifMessage, setNotifMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [deleteUser, setDeleteUser] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    api.listUsers().then(({ users }) => setUsers(users));
    api.listSkills().then(({ skills }) => setSkills(skills));
  }, []);

  const handleDeleteSkill = async (id: string) => {
    try {
      await api.deleteSkill(id);
      setSkills(prev => prev.filter(s => s.id !== id));
      toast({ title: 'Skill deleted' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleSendNotification = async () => {
    if (!notifMessage.trim() || !user) return;
    setSending(true);
    try {
      await api.createNotification({ message: notifMessage.trim() });
      setNotifMessage('');
      toast({ title: 'Notification sent to all students!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      await api.deleteUser(deleteUser.id);
      setUsers(prev => prev.filter(u => u.id !== deleteUser.id));
      toast({ title: 'User deleted successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setDeleting(false);
      setDeleteUser(null);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Manage users, skills, and send notifications</p>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card className="shadow-card">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-primary/10 p-3"><Users className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-accent/10 p-3"><BookOpen className="h-5 w-5 text-accent" /></div>
              <div>
                <p className="text-2xl font-bold">{skills.length}</p>
                <p className="text-sm text-muted-foreground">Total Skills</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="h-5 w-5 text-primary" />
                <span className="font-heading font-semibold text-sm">Broadcast Notification</span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={notifMessage}
                  onChange={e => setNotifMessage(e.target.value)}
                  placeholder="e.g. Workshop on AI tomorrow at 5PM"
                  className="text-sm"
                />
                <Button size="sm" onClick={handleSendNotification} disabled={sending} className="gap-1">
                  <Send className="h-3 w-3" /> Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="mt-8">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle>All Users</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.username}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                            {u.role || 'student'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(u.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {u.role === 'student' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteUser(u)}
                              disabled={u.id === user?.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="skills">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map(skill => (
                <SkillCard
                  key={skill.id}
                  id={skill.id}
                  title={skill.title}
                  description={skill.description}
                  category={skill.category}
                  username={skill.username || 'Unknown'}
                  userId={skill.user_id}
                  currentUserId={user?.id}
                  isAdmin
                  onDelete={handleDeleteSkill}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={!!deleteUser} onOpenChange={() => !deleting && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteUser?.username}</strong>? This action cannot be undone
              and will permanently remove the user and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
