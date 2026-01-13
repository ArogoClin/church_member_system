import { useState, useEffect } from 'react';
import Input from '../../common/Input';
import Select from '../../common/Select';
import Button from '../../common/Button';
import { GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, MEMBER_STATUS_OPTIONS } from '../../../utils/constants';
import { jumuiaService } from '../../../services/jumuiaService';
import { groupService } from '../../../services/groupService';

const MemberForm = ({ member, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    phone: '',
    maritalStatus: 'SINGLE',
    numberOfChildren: 0,
    jumuiaId: '',
    groupId: '',
    status: 'ACTIVE'
  });
  const [jumuias, setJumuias] = useState([]);
  const [groups, setGroups] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Load jumuias and groups
    const loadData = async () => {
      try {
        const [jumuiasRes, groupsRes] = await Promise.all([
          jumuiaService.getJumuias(),
          groupService.getGroups()
        ]);
        setJumuias(jumuiasRes.data);
        setGroups(groupsRes.data);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();

    // If editing, populate form
    if (member) {
      setFormData({
        firstName: member.firstName,
        lastName: member.lastName,
        gender: member.gender,
        dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
        phone: member.phone || '',
        maritalStatus: member.maritalStatus,
        numberOfChildren: member.numberOfChildren,
        jumuiaId: member.jumuiaId || '',
        groupId: member.groupId || '',
        status: member.status
      });
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numberOfChildren' ? parseInt(value) || 0 : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Convert empty strings to null for optional fields
      const submitData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth || null,
        phone: formData.phone || null,
        jumuiaId: formData.jumuiaId || null,
        groupId: formData.groupId || null
      };
      onSubmit(submitData);
    }
  };

  const jumuiaOptions = jumuias.map(j => ({ value: j.id, label: j.name }));
  const groupOptions = groups.map(g => ({ value: g.id, label: g.name }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          required
          placeholder="John"
        />

        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
          required
          placeholder="Doe"
        />

        <Select
          label="Gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          options={GENDER_OPTIONS}
          error={errors.gender}
          required
        />

        <Input
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
          placeholder="YYYY-MM-DD"
        />

        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+254712345678"
        />

        <Select
          label="Marital Status"
          name="maritalStatus"
          value={formData.maritalStatus}
          onChange={handleChange}
          options={MARITAL_STATUS_OPTIONS}
          required
        />

        <Input
          label="Number of Children"
          name="numberOfChildren"
          type="number"
          min="0"
          value={formData.numberOfChildren}
          onChange={handleChange}
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={MEMBER_STATUS_OPTIONS}
          required
        />

        <Select
          label="Jumuia"
          name="jumuiaId"
          value={formData.jumuiaId}
          onChange={handleChange}
          options={jumuiaOptions}
          placeholder="Select Jumuia (Optional)"
        />

        <Select
          label="Group"
          name="groupId"
          value={formData.groupId}
          onChange={handleChange}
          options={groupOptions}
          placeholder="Select Group (Optional)"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : (member ? 'Update Member' : 'Create Member')}
        </Button>
      </div>
    </form>
  );
};

export default MemberForm;