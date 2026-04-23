import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import SkillCard from '@/components/SkillCard';
import ChatWindow from '@/components/ChatWindow';
import NotificationPanel from '@/components/NotificationPanel';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<any[]>([]);
  const [chatTarget, setChatTarget] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();

  const fetchSkills = async () => {
    const { skills } = await api.listSkills();
    setSkills(skills);
  };

  useEffect(() => { fetchSkills(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteSkill(id);
      setSkills(prev => prev.filter(s => s.id !== id));
      toast({ title: 'Skill deleted' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Student Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Browse skills and connect with peers</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationPanel />
            <Link to="/add-skill">
              <Button className="gap-2"><Plus className="h-4 w-4" /> Add Skill</Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard
              key={skill.id}
              id={skill.id}
              title={skill.title}
              description={skill.description}
              category={skill.category}
              username={skill.username || 'Unknown'}
              userId={skill.user_id}
              currentUserId={user?.id}
              onDelete={handleDelete}
              onChat={(userId, username) => setChatTarget({ id: userId, name: username })}
            />
          ))}
          {skills.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              No skills posted yet. Be the first to share!
            </div>
          )}
        </div>
      </div>

      {chatTarget && (
        <ChatWindow
          receiverId={chatTarget.id}
          receiverName={chatTarget.name}
          onClose={() => setChatTarget(null)}
        />
      )}
    </div>
  );
}
