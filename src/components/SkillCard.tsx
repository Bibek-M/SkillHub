import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Trash2, User } from 'lucide-react';

interface SkillCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  username: string;
  userId: string;
  currentUserId?: string;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onChat?: (userId: string, username: string) => void;
}

export default function SkillCard({
  id, title, description, category, username, userId,
  currentUserId, isAdmin, onDelete, onChat,
}: SkillCardProps) {
  const isOwner = currentUserId === userId;

  return (
    <Card className="shadow-card transition-all hover:shadow-elevated hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="font-heading text-lg">{title}</CardTitle>
          <Badge variant="secondary" className="text-xs">{category}</Badge>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <User className="h-3 w-3" />
          {username}
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground line-clamp-3">{description}</p>
        <div className="flex gap-2">
          {!isOwner && onChat && (
            <Button size="sm" variant="outline" onClick={() => onChat(userId, username)} className="gap-1">
              <MessageCircle className="h-3 w-3" /> Chat
            </Button>
          )}
          {(isOwner || isAdmin) && onDelete && (
            <Button size="sm" variant="destructive" onClick={() => onDelete(id)} className="gap-1">
              <Trash2 className="h-3 w-3" /> Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
