import { useState } from 'react';
import Modal from '@components/ui/Modal';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';

interface CreateColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string }) => Promise<void>;
}

const CreateColumnModal = ({ isOpen, onClose, onSubmit }: CreateColumnModalProps) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Column name is required');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await onSubmit({ name: name.trim() });
      setName('');
      onClose();
    } catch (err) {
      setError('Failed to create column');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Column" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Column Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., To Do, In Progress, Done"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Column
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateColumnModal;
