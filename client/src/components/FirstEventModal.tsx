import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface FirstEventModalProps {
  cityName: string;
  open: boolean;
  onClose: () => void;
}

export function FirstEventModal({ cityName, open, onClose }: FirstEventModalProps) {
  const [, setLocation] = useLocation();

  const handleCreateEvent = () => {
    setLocation('/create');
    onClose();
  };

  const handleInviteFriends = () => {
    setLocation('/invite');
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Be the first in {cityName}!</DialogTitle>
        </DialogHeader>
        <p className="my-4 text-sm text-muted-foreground">
          No events have been created in {cityName} yet.  
          Would you like to create the first one and invite your friends?
        </p>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Maybe Later</Button>
          <Button onClick={handleCreateEvent}>Create Event</Button>
          <Button onClick={handleInviteFriends}>Invite Friends</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}