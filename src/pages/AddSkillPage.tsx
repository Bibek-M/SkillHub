import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

const CATEGORIES = ['Programming', 'Design', 'Music', 'Languages', 'Math', 'Science', 'Writing', 'Sports', 'Other'];

export default function AddSkillPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category || !user) return;
    setLoading(true);
    try {
      await api.createSkill({
        title: title.trim(),
        description: description.trim(),
        category,
      });
      toast({ title: 'Skill added!' });
      navigate('/dashboard');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg shadow-elevated">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Add a Skill</CardTitle>
            <CardDescription>Share what you can teach or help with</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Skill Name</Label>
                <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Python Programming" required maxLength={100} />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what you offer..." rows={4} required maxLength={1000} />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={loading || !category} className="flex-1">
                  {loading ? 'Adding...' : 'Add Skill'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
