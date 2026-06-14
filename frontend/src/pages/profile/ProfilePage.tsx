import EmptyState from '@components/dashboard/EmptyState';
import { Users } from 'lucide-react';

const ProfilePage = () => {
  return (
    <EmptyState
      icon={<Users className="h-5 w-5" />}
      title="Profile"
      description="Profile page is being implemented."
      action={null}
    />
  );
};

export default ProfilePage;

