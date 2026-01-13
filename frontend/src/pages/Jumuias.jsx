import { useState, useEffect } from 'react';
import { jumuiaService } from '../services/jumuiaService';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { UsersRound, Plus, Edit, Trash2, Users } from 'lucide-react';

const Jumuias = () => {
  const [jumuias, setJumuias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [editingJumuia, setEditingJumuia] = useState(null);
  const [selectedJumuia, setSelectedJumuia] = useState(null);
  const [jumuiaMembers, setJumuiaMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false); // ADD THIS
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [formError, setFormError] = useState('');

  const fetchJumuias = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await jumuiaService.getJumuias();
      setJumuias(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load jumuias');
    } finally {
      setLoading(false);
    }
  };

  const fetchJumuiaMembers = async (jumuiaId) => {
    setLoadingMembers(true); // START LOADING
    try {
      const response = await jumuiaService.getJumuiaMembers(jumuiaId);
      setJumuiaMembers(response.data);
    } catch (err) {
      console.error('Failed to load members:', err);
      setJumuiaMembers([]); // Set empty on error
    } finally {
      setLoadingMembers(false); // STOP LOADING
    }
  };

  useEffect(() => {
    fetchJumuias();
  }, []);

  const handleAddJumuia = () => {
    setEditingJumuia(null);
    setFormData({ name: '' });
    setFormError('');
    setShowModal(true);
  };

  const handleEditJumuia = (jumuia) => {
    setEditingJumuia(jumuia);
    setFormData({ name: jumuia.name });
    setFormError('');
    setShowModal(true);
  };

  const handleViewMembers = async (jumuia) => {
    setSelectedJumuia(jumuia);
    setJumuiaMembers([]); // Reset to empty array
    setShowMembersModal(true);
    await fetchJumuiaMembers(jumuia.id);
  };

  const handleDeleteJumuia = async (jumuia) => {
    if (!window.confirm(`Are you sure you want to delete "${jumuia.name}"?`)) {
      return;
    }

    try {
      await jumuiaService.deleteJumuia(jumuia.id);
      fetchJumuias();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete jumuia');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setFormError('Jumuia name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingJumuia) {
        await jumuiaService.updateJumuia(editingJumuia.id, formData);
      } else {
        await jumuiaService.createJumuia(formData);
      }
      setShowModal(false);
      fetchJumuias();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save jumuia');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading jumuias..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchJumuias} />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jumuias</h1>
          <p className="text-gray-600 mt-1">
            {jumuias.length} total jumuia{jumuias.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleAddJumuia}>
          Add Jumuia
        </Button>
      </div>

      {/* Content */}
      {jumuias.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <UsersRound className="w-8 h-8 text-success-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Jumuias Yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first jumuia</p>
          <Button variant="primary" icon={Plus} onClick={handleAddJumuia}>
            Add First Jumuia
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jumuias.map((jumuia) => (
            <div key={jumuia.id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <UsersRound className="w-6 h-6 text-success-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{jumuia.name}</h3>
                    <p className="text-sm text-gray-600">
                      {jumuia._count.members} member{jumuia._count.members !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleViewMembers(jumuia)}
                  className="flex-1 btn-secondary btn-sm flex items-center justify-center space-x-1 rounded-lg"
                >
                  <Users className="w-4 h-4" />
                  <span>View Members</span>
                </button>
                <button
                  onClick={() => handleEditJumuia(jumuia)}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteJumuia(jumuia)}
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
        title={editingJumuia ? 'Edit Jumuia' : 'Add New Jumuia'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Jumuia Name"
            name="name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ name: e.target.value });
              setFormError('');
            }}
            error={formError}
            required
            placeholder="e.g., St. Peter Jumuia"
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
              {submitting ? 'Saving...' : (editingJumuia ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Members Modal - FIXED VERSION */}
      <Modal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        title={`${selectedJumuia?.name} - Members`}
        size="lg"
      >
        {loadingMembers ? (
          // Show loading state instead of "no members"
          <div className="py-8">
            <Loader size="sm" text="Loading members..." />
          </div>
        ) : jumuiaMembers.length === 0 ? (
          // Only show "no members" after loading is complete
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600">No members in this jumuia yet</p>
          </div>
        ) : (
          // Show members list
          <div className="space-y-3">
            {jumuiaMembers.map((member) => (
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

export default Jumuias;