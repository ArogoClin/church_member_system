import { Search, Filter, X } from 'lucide-react';
import Select from '../../common/Select';
import { GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, MEMBER_STATUS_OPTIONS } from '../../../utils/constants';

const MemberFilters = ({ filters, onFilterChange, onClearFilters, jumuias, groups }) => {
  const hasActiveFilters = filters.search || filters.gender || filters.maritalStatus || 
                          filters.jumuiaId || filters.groupId || filters.status;

  const jumuiaOptions = jumuias.map(j => ({ value: j.id, label: j.name }));
  const groupOptions = groups.map(g => ({ value: g.id, label: g.name }));

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-danger-600 hover:text-danger-700 flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Search - Full width on mobile */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Gender Filter */}
          <Select
            name="gender"
            value={filters.gender}
            onChange={(e) => onFilterChange('gender', e.target.value)}
            options={GENDER_OPTIONS}
            placeholder="All Genders"
          />

          {/* Status Filter */}
          <Select
            name="status"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            options={MEMBER_STATUS_OPTIONS}
            placeholder="All Status"
          />

          {/* Marital Status Filter */}
          <Select
            name="maritalStatus"
            value={filters.maritalStatus}
            onChange={(e) => onFilterChange('maritalStatus', e.target.value)}
            options={MARITAL_STATUS_OPTIONS}
            placeholder="All Marital Status"
          />

          {/* Jumuia Filter */}
          <Select
            name="jumuiaId"
            value={filters.jumuiaId}
            onChange={(e) => onFilterChange('jumuiaId', e.target.value)}
            options={jumuiaOptions}
            placeholder="All Jumuias"
          />

          {/* Group Filter */}
          <Select
            name="groupId"
            value={filters.groupId}
            onChange={(e) => onFilterChange('groupId', e.target.value)}
            options={groupOptions}
            placeholder="All Groups"
          />
        </div>
      </div>
    </div>
  );
};

export default MemberFilters;