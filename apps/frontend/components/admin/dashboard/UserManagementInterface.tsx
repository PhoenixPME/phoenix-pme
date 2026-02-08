'use client';

import * as React from 'react';
import { Search, Filter, Download, Eye, Mail, Shield, CheckCircle, XCircle, MoreVertical, UserPlus, UserX, Users } from 'lucide-react';
import { Search, Filter, Download, Eye, Mail, Shield, CheckCircle, XCircle, MoreVertical, UserPlus, UserX } from 'lucide-react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'buyer' | 'seller' | 'admin' | 'moderator';
  status: 'active' | 'pending' | 'suspended' | 'verified';
  kycStatus: 'not_started' | 'pending' | 'verified' | 'rejected';
  joinDate: Date;
  lastActive: Date;
  totalAuctions: number;
  completedTransactions: number;
  disputeRate: number;
  walletAddress?: string;
  twoFactorEnabled: boolean;
  ipAddress?: string;
  country?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  kycPending: number;
  suspendedUsers: number;
  avgDisputeRate: number;
}

export interface UserManagementInterfaceProps {
  users: User[];
  stats: UserStats;
  onViewUser: (userId: string) => void;
  onEditUser: (userId: string) => void;
  onVerifyKYC: (userId: string) => void;
  onRejectKYC: (userId: string) => void;
  onSuspendUser: (userId: string) => void;
  onActivateUser: (userId: string) => void;
  onSendVerification: (userId: string) => void;
  onExportUsers: (format: 'csv' | 'json') => void;
  onAddUser: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export default function UserManagementInterface({
  users,
  stats,
  onViewUser,
  onEditUser,
  onVerifyKYC,
  onRejectKYC,
  onSuspendUser,
  onActivateUser,
  onSendVerification,
  onExportUsers,
  onAddUser,
  onRefresh,
  isLoading = false,
}: UserManagementInterfaceProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [kycFilter, setKycFilter] = React.useState<string>('all');
  const [selectedUsers, setSelectedUsers] = React.useState<Set<string>>(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);

  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.walletAddress && user.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesKYC = kycFilter === 'all' || user.kycStatus === kycFilter;
      
      return matchesSearch && matchesRole && matchesStatus && matchesKYC;
    });
  }, [users, searchQuery, roleFilter, statusFilter, kycFilter]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-purple-100 text-purple-800';
      case 'seller': return 'bg-blue-100 text-blue-800';
      case 'buyer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKYCColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const past = new Date(date);
    const diff = now.getTime() - past.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const handleBulkAction = (action: 'verify' | 'suspend' | 'activate' | 'send_verification') => {
    selectedUsers.forEach(userId => {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      switch (action) {
        case 'verify':
          if (user.kycStatus === 'pending') onVerifyKYC(userId);
          break;
        case 'suspend':
          if (user.status === 'active') onSuspendUser(userId);
          break;
        case 'activate':
          if (user.status === 'suspended') onActivateUser(userId);
          break;
        case 'send_verification':
          onSendVerification(userId);
          break;
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage platform users, KYC verification, and permissions</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={onAddUser}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </button>
          <button
            onClick={() => onExportUsers('csv')}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active</span>
              <span className="font-medium text-green-600">{stats.activeUsers}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">KYC Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.kycPending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Shield className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">New Today</span>
              <span className="font-medium">{stats.newUsersToday}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Suspended</p>
              <p className="text-2xl font-bold text-gray-900">{stats.suspendedUsers}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Dispute Rate</span>
              <span className={`font-medium ${stats.avgDisputeRate < 5 ? 'text-green-600' : stats.avgDisputeRate < 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                {stats.avgDisputeRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">User Roles</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'seller').length}/{users.filter(u => u.role === 'buyer').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sellers/Buyers</span>
              <span className="font-medium">
                Admin: {users.filter(u => u.role === 'admin').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="space-y-4">
          {/* Main Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or wallet address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
              />
            </div>
            
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Roles</option>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                  <option value="verified">Verified</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">KYC Status</label>
                <select
                  value={kycFilter}
                  onChange={(e) => setKycFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All KYC</option>
                  <option value="not_started">Not Started</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkAction('verify')}
                    className="px-3 py-1.5 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    Verify KYC
                  </button>
                  <button
                    onClick={() => handleBulkAction('suspend')}
                    className="px-3 py-1.5 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() => handleBulkAction('activate')}
                    className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction('send_verification')}
                    className="px-3 py-1.5 text-sm bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                  >
                    Send Verification
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedUsers(new Set())}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
                      } else {
                        setSelectedUsers(new Set());
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KYC Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={(e) => {
                        const newSet = new Set(selectedUsers);
                        if (e.target.checked) {
                          newSet.add(user.id);
                        } else {
                          newSet.delete(user.id);
                        }
                        setSelectedUsers(newSet);
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="font-medium text-gray-600">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.walletAddress && (
                          <div className="text-xs text-gray-400 font-mono mt-1">
                            {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getKYCColor(user.kycStatus)}`}>
                        {user.kycStatus === 'not_started' ? 'Not Started' : 
                         user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1)}
                      </span>
                      {user.twoFactorEnabled && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800">
                          2FA
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      Joined {formatDate(user.joinDate)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Last active {formatTimeAgo(user.lastActive)}
                    </div>
                    {user.country && (
                      <div className="text-xs text-gray-400 mt-1">
                        {user.country} {user.ipAddress ? `• ${user.ipAddress}` : ''}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Auctions:</span>
                        <span className="font-medium">{user.totalAuctions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Transactions:</span>
                        <span className="font-medium">{user.completedTransactions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Dispute Rate:</span>
                        <span className={`font-medium ${user.disputeRate < 5 ? 'text-green-600' : user.disputeRate < 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {user.disputeRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewUser(user.id)}
                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditUser(user.id)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        title="Edit User"
                      >
                        ✏️
                      </button>
                      {user.kycStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => onVerifyKYC(user.id)}
                            className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                            title="Verify KYC"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onRejectKYC(user.id)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            title="Reject KYC"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onSendVerification(user.id)}
                        className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded"
                        title="Send Verification"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      {user.status === 'active' ? (
                        <button
                          onClick={() => onSuspendUser(user.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="Suspend User"
                        >
                          ⏸️
                        </button>
                      ) : (
                        <button
                          onClick={() => onActivateUser(user.id)}
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                          title="Activate User"
                        >
                          ▶️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">👤</div>
            <p className="text-gray-600">No users found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="text-center text-sm text-gray-500">
        Showing {filteredUsers.length} of {users.length} users
        {searchQuery && ` • Searching: "${searchQuery}"`}
        {(roleFilter !== 'all' || statusFilter !== 'all' || kycFilter !== 'all') && ' • Filtered'}
      </div>

      {/* Quick Stats */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600">Buyers</div>
            <div className="font-medium">{users.filter(u => u.role === 'buyer').length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Sellers</div>
            <div className="font-medium">{users.filter(u => u.role === 'seller').length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">2FA Enabled</div>
            <div className="font-medium">{users.filter(u => u.twoFactorEnabled).length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Avg. Activity</div>
            <div className="font-medium">
              {formatTimeAgo(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)).replace(' ago', '')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
