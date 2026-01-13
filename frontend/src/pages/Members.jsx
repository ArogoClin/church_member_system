import { useState, useEffect } from 'react';
import { memberService } from '../services/memberService';
import { jumuiaService } from '../services/jumuiaService';
import { groupService } from '../services/groupService';
import MemberFilters from '../components/features/members/MemberFilters';
import MemberForm from '../components/features/members/MemberForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Pagination from '../components/common/Pagination';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { UserPlus, Edit, Trash2, Phone, MoreVertical } from 'lucide-react';
import { formatDate, calculateAge } from '../utils/helpers';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [jumuias, setJumuias] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    maritalStatus: '',
    jumuiaId: '',
    groupId: '',
    status: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const fetchMembers = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: 10,
        ...filters
      };

      const response = await memberService.getMembers(params);
      setMembers(response.data);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        total: response.total
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const fetchJumuiasAndGroups = async () => {
    try {
      const [jumuiasRes, groupsRes] = await Promise.all([
        jumuiaService.getJumuias(),
        groupService.getGroups()
      ]);
      setJumuias(jumuiasRes.data);
      setGroups(groupsRes.data);
    } catch (err) {
      console.error('Failed to load jumuias/groups:', err);
    }
  };

  useEffect(() => {
    fetchJumuiasAndGroups();
  }, []);

  useEffect(() => {
    fetchMembers(1);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      gender: '',
      maritalStatus: '',
      jumuiaId: '',
      groupId: '',
      status: ''
    });
  };

  const handlePageChange = (page) => {
    fetchMembers(page);
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setShowModal(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setShowModal(true);
  };

  const handleDeleteMember = async (member) => {
    if (!window.confirm(`Are you sure you want to delete ${member.firstName} ${member.lastName}?`)) {
      return;
    }

    try {
      await memberService.deleteMember(member.id);
      fetchMembers(pagination.currentPage);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete member');
    }
  };

  const handleSubmitMember = async (data) => {
    setSubmitting(true);
    try {
      if (editingMember) {
        await memberService.updateMember(editingMember.id, data);
      } else {
        await memberService.createMember(data);
      }
      setShowModal(false);
      fetchMembers(pagination.currentPage);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save member');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600 mt-1">
            {pagination.total} total member{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden btn-secondary btn-sm"
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
          <Button variant="primary" icon={UserPlus} onClick={handleAddMember}>
            <span className="hidden sm:inline">Add Member</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
        <MemberFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          jumuias={jumuias}
          groups={groups}
        />
      </div>

      {/* Content */}
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => fetchMembers(pagination.currentPage)} />
      ) : members.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">No members found</p>
          <Button variant="primary" icon={UserPlus} onClick={handleAddMember}>
            Add First Member
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="table-container">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Name</th>
                    <th className="table-header-cell">Gender</th>
                    <th className="table-header-cell">Age</th>
                    <th className="table-header-cell">Phone</th>
                    <th className="table-header-cell">Marital Status</th>
                    <th className="table-header-cell">Jumuia</th>
                    <th className="table-header-cell">Group</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td className="table-cell">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-primary-700">
                              {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${member.gender === 'MALE' ? 'badge-info' : 'badge-gray'}`}>
                          {member.gender}
                        </span>
                      </td>
                      <td className="table-cell text-gray-600">
                        {member.dateOfBirth ? `${calculateAge(member.dateOfBirth)} yrs` : 'N/A'}
                      </td>
                      <td className="table-cell">
                        {member.phone ? (
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{member.phone}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <span className="text-gray-600">{member.maritalStatus}</span>
                      </td>
                      <td className="table-cell">
                        {member.jumuia ? (
                          <span className="text-gray-900">{member.jumuia.name}</span>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                      <td className="table-cell">
                        {member.group ? (
                          <span className="text-gray-900">{member.group.name}</span>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${member.status === 'ACTIVE' ? 'badge-success' : 'badge-gray'}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditMember(member)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member)}
                            className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {members.map((member) => (
              <div key={member.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary-700">
                        {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{member.phone || 'No phone'}</p>
                    </div>
                  </div>
                  <span className={`badge ${member.status === 'ACTIVE' ? 'badge-success' : 'badge-gray'}`}>
                    {member.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Gender:</span>
                    <span className="ml-2 text-gray-900">{member.gender}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Age:</span>
                    <span className="ml-2 text-gray-900">
                      {member.dateOfBirth ? `${calculateAge(member.dateOfBirth)} yrs` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2 text-gray-900">{member.maritalStatus}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Children:</span>
                    <span className="ml-2 text-gray-900">{member.numberOfChildren}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Jumuia:</span>
                    <span className="ml-2 text-gray-900">{member.jumuia?.name || 'None'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Group:</span>
                    <span className="ml-2 text-gray-900">{member.group?.name || 'None'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleEditMember(member)}
                    className="flex-1 btn-secondary btn-sm flex items-center justify-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member)}
                    className="flex-1 btn-danger btn-sm flex items-center justify-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingMember ? 'Edit Member' : 'Add New Member'}
        size="lg"
      >
        <MemberForm
          member={editingMember}
          onSubmit={handleSubmitMember}
          onCancel={() => setShowModal(false)}
          loading={submitting}
        />
      </Modal>
    </div>
  );
};

export default Members;