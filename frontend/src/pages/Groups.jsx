import { useState, useEffect } from 'react';
import { groupService } from '../services/groupService';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { UserCog, Plus, Edit, Trash2, Users } from 'lucide-react';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false); // ADD THIS
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [formError, setFormError] = useState('');

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await groupService.getGroups();
      setGroups(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMembers = async (groupId) => {
    setLoadingMembers(true); // START LOADING
    try {
      const response = await groupService.getGroupMembers(groupId);
      setGroupMembers(response.data);
    } catch (err) {
      console.error('Failed to load members:', err);
      setGroupMembers([]);
    } finally {
      setLoadingMembers(false); // STOP LOADING
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleAddGroup = () => {
    setEditingGroup(null);
    setFormData({ name: '' });
    setFormError('');
    setShowModal(true);
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setFormData({ name: group.name });
    setFormError('');
    setShowModal(true);
  };

  const handleViewMembers = async (group) => {
    setSelectedGroup(group);
    setGroupMembers([]); // Reset
    setShowMembersModal(true);
    await fetchGroupMembers(group.id);
  };

  const handleDeleteGroup = async (group) => {
    if (!window.confirm(`Are you sure you want to delete "${group.name}"?`)) {
      return;
    }

    try {
      await groupService.deleteGroup(group.id);
      fetchGroups();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete group');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setFormError('Group name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingGroup) {
        await groupService.updateGroup(editingGroup.id, formData);
      } else {
        await groupService.createGroup(formData);
      }
      setShowModal(false);
      fetchGroups();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save group');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading groups..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchGroups} />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
          <p className="text-gray-600 mt-1">
            {groups.length} total group{groups.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleAddGroup}>
          Add Group
        </Button>
      </div>

      {/* Content */}
      {groups.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-warning-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCog className="w-8 h-8 text-warning-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Groups Yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first group</p>
          <Button variant="primary" icon={Plus} onClick={handleAddGroup}>
            Add First Group
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group.id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserCog className="w-6 h-6 text-warning-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{group.name}</h3>
                    <p className="text-sm text-gray-600">
                      {group._count.members} member{group._count.members !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleViewMembers(group)}
                  className="flex-1 btn-secondary btn-sm flex items-center justify-center space-x-1"
                >
                  <Users className="w-4 h-4" />
                  <span>View Members</span>
                </button>
                <button
                  onClick={() => handleEditGroup(group)}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteGroup(group)}
                  className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingGroup ? 'Edit Group' : 'Add New Group'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Group Name"
            name="name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ name: e.target.value });
              setFormError('');
            }}
            error={formError}
            required
            placeholder="e.g., Choir, Youth Ministry"
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (editingGroup ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Members Modal - FIXED VERSION */}
      <Modal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        title={`${selectedGroup?.name} - Members`}
        size="lg"
      >
        {loadingMembers ? (
          <div className="py-8">
            <Loader size="sm" text="Loading members..." />
          </div>
        ) : groupMembers.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600">No members in this group yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-700">
                      {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {member.phone || 'No phone'} • {member.gender}
                    </p>
                  </div>
                </div>
                <span className={`badge ${member.status === 'ACTIVE' ? 'badge-success' : 'badge-gray'}`}>
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Groups;
