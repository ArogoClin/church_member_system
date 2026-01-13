import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { memberService } from '../services/memberService';
import { jumuiaService } from '../services/jumuiaService';
import { groupService } from '../services/groupService';
import StatCard from '../components/common/StatCard';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  UsersRound,
  UserCog,
  TrendingUp,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [jumuias, setJumuias] = useState([]);
  const [groups, setGroups] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsRes, jumuiasRes, groupsRes, membersRes] = await Promise.all([
        memberService.getStats(),
        jumuiaService.getJumuias(),
        groupService.getGroups(),
        memberService.getMembers({ limit: 5, page: 1 })
      ]);

      setStats(statsRes.data);
      setJumuias(jumuiasRes.data);
      setGroups(groupsRes.data);
      setRecentMembers(membersRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader text="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchDashboardData} />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Members"
          value={stats?.totalMembers || 0}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Active Members"
          value={stats?.activeMembers || 0}
          icon={UserCheck}
          color="success"
          subtitle={`${stats?.inactiveMembers || 0} inactive`}
        />
        <StatCard
          title="Male Members"
          value={stats?.maleMembers || 0}
          icon={Activity}
          color="info"
          subtitle={`${stats?.femaleMembers || 0} female`}
        />
        <StatCard
          title="Married Members"
          value={stats?.marriedMembers || 0}
          icon={TrendingUp}
          color="warning"
          subtitle={`${stats?.singleMembers || 0} single`}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/members?action=add"
            className="card hover:shadow-md transition-shadow duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-50 group-hover:bg-primary-100 rounded-lg flex items-center justify-center transition-colors duration-200">
                <UserPlus className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Add New Member</h3>
                <p className="text-sm text-gray-600">Register a new church member</p>
              </div>
            </div>
          </Link>

          <Link
            to="/jumuias"
            className="card hover:shadow-md transition-shadow duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-success-50 group-hover:bg-success-100 rounded-lg flex items-center justify-center transition-colors duration-200">
                <UsersRound className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Jumuias</h3>
                <p className="text-sm text-gray-600">{jumuias.length} jumuias total</p>
              </div>
            </div>
          </Link>

          <Link
            to="/groups"
            className="card hover:shadow-md transition-shadow duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-warning-50 group-hover:bg-warning-100 rounded-lg flex items-center justify-center transition-colors duration-200">
                <UserCog className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Groups</h3>
                <p className="text-sm text-gray-600">{groups.length} groups total</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Members</h2>
            <Link to="/members" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </Link>
          </div>
          {recentMembers.length > 0 ? (
            <div className="space-y-3">
              {recentMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                      <p className="text-sm text-gray-600">{member.phone || 'No phone'}</p>
                    </div>
                  </div>
                  <span className={`badge ${member.status === 'ACTIVE' ? 'badge-success' : 'badge-gray'}`}>
                    {member.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No members yet</p>
          )}
        </div>

        {/* Jumuias Overview */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Jumuias Overview</h2>
            <Link to="/jumuias" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </Link>
          </div>
          {jumuias.length > 0 ? (
            <div className="space-y-3">
              {jumuias.slice(0, 5).map((jumuia) => (
                <div key={jumuia.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                      <UsersRound className="w-5 h-5 text-success-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{jumuia.name}</p>
                      <p className="text-sm text-gray-600">
                        {jumuia._count.members} {jumuia._count.members === 1 ? 'member' : 'members'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No jumuias yet</p>
          )}
        </div>
      </div>

      {/* Groups Overview */}
      <div className="card mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Groups Overview</h2>
          <Link to="/groups" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All →
          </Link>
        </div>
        {groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <div key={group.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center">
                    <UserCog className="w-5 h-5 text-warning-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{group.name}</p>
                    <p className="text-sm text-gray-600">
                      {group._count.members} {group._count.members === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No groups yet</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;