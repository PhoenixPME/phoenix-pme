'use client';

import * as React from 'react';
import { Search, Filter, Download, MessageSquare, Award, FileText, Clock, AlertTriangle, CheckCircle, XCircle, Users, DollarSign, TrendingUp } from 'lucide-react';

export interface Dispute {
  id: string;
  disputeId: string;
  transactionId: string;
  auctionId: string;
  auctionTitle: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  currency: string;
  reason: 'item_not_received' | 'item_not_as_described' | 'damaged_item' | 'late_delivery' | 'fraud' | 'other';
  status: 'open' | 'under_review' | 'awaiting_evidence' | 'escalated' | 'resolved' | 'cancelled';
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  updatedAt: Date;
  deadline: Date;
  assignedTo?: string;
  assignedToName?: string;
  evidence: Evidence[];
  communication: Communication[];
  resolution?: {
    decision: 'refund_buyer' | 'release_seller' | 'partial_refund' | 'split_funds' | 'cancel_transaction';
    refundAmount?: number;
    releasedAmount?: number;
    reason: string;
    resolvedBy: string;
    resolvedAt: Date;
    notes?: string;
  };
}

export interface Evidence {
  id: string;
  type: 'image' | 'document' | 'video' | 'message' | 'tracking';
  title: string;
  description?: string;
  url: string;
  uploadedBy: 'buyer' | 'seller' | 'admin' | 'system';
  uploadedAt: Date;
  verified: boolean;
}

export interface Communication {
  id: string;
  type: 'message' | 'email' | 'system_note' | 'decision';
  from: 'buyer' | 'seller' | 'admin' | 'system';
  fromName: string;
  content: string;
  timestamp: Date;
  attachments?: string[];
  readBy: string[];
}

export interface DisputeStats {
  totalDisputes: number;
  openDisputes: number;
  resolvedDisputes: number;
  avgResolutionTime: number; // in hours
  totalAmountInDispute: number;
  buyerWinRate: number;
  sellerWinRate: number;
  escalatedCount: number;
  overdueCount: number;
}

export interface DisputeResolutionSystemProps {
  disputes: Dispute[];
  stats: DisputeStats;
  moderators: Array<{ id: string; name: string; activeDisputes: number }>;
  onViewDispute: (disputeId: string) => void;
  onAssignDispute: (disputeId: string, moderatorId: string) => void;
  onUpdateStatus: (disputeId: string, status: Dispute['status']) => void;
  onRequestEvidence: (disputeId: string, party: 'buyer' | 'seller', evidenceType: string) => void;
  onSendMessage: (disputeId: string, message: string, attachments?: string[]) => void;
  onMakeDecision: (disputeId: string, decision: Dispute['resolution']['decision'], amount?: number, notes?: string) => void;
  onEscalateDispute: (disputeId: string, reason: string) => void;
  onExportDisputes: (format: 'csv' | 'json') => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export default function DisputeResolutionSystem({
  disputes,
  stats,
  moderators,
  onViewDispute,
  onAssignDispute,
  onUpdateStatus,
  onRequestEvidence,
  onSendMessage,
  onMakeDecision,
  onEscalateDispute,
  onExportDisputes,
  onRefresh,
  isLoading = false,
}: DisputeResolutionSystemProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [severityFilter, setSeverityFilter] = React.useState<string>('all');
  const [reasonFilter, setReasonFilter] = React.useState<string>('all');
  const [assignedFilter, setAssignedFilter] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<'created' | 'deadline' | 'amount' | 'severity'>('created');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [selectedDisputes, setSelectedDisputes] = React.useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = React.useState(false);

  const filteredAndSortedDisputes = React.useMemo(() => {
    let filtered = disputes.filter(dispute => {
      const matchesSearch = 
        dispute.disputeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dispute.auctionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dispute.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dispute.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dispute.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || dispute.severity === severityFilter;
      const matchesReason = reasonFilter === 'all' || dispute.reason === reasonFilter;
      const matchesAssigned = assignedFilter === 'all' || 
        (assignedFilter === 'unassigned' && !dispute.assignedTo) ||
        (assignedFilter === 'assigned' && dispute.assignedTo) ||
        dispute.assignedTo === assignedFilter;
      
      return matchesSearch && matchesStatus && matchesSeverity && matchesReason && matchesAssigned;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'deadline':
          aValue = new Date(a.deadline).getTime();
          bValue = new Date(b.deadline).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aValue = severityOrder[a.severity] || 0;
          bValue = severityOrder[b.severity] || 0;
          break;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [disputes, searchQuery, statusFilter, severityFilter, reasonFilter, assignedFilter, sortBy, sortOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'awaiting_evidence': return 'bg-orange-100 text-orange-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'item_not_received': return 'Item Not Received';
      case 'item_not_as_described': return 'Item Not as Described';
      case 'damaged_item': return 'Damaged Item';
      case 'late_delivery': return 'Late Delivery';
      case 'fraud': return 'Fraud';
      case 'other': return 'Other';
      default: return reason.replace('_', ' ').toUpperCase();
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ` ${currency}`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const past = new Date(date);
    const diff = now.getTime() - past.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatDeadline = (date: Date) => {
    const now = new Date();
    const deadline = new Date(date);
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return 'Overdue';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 24) return `${hours}h left`;
    return `${days}d left`;
  };

  const getDeadlineColor = (date: Date) => {
    const now = new Date();
    const deadline = new Date(date);
    const diff = deadline.getTime() - now.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (diff <= 0) return 'bg-red-100 text-red-800';
    if (hours < 24) return 'bg-orange-100 text-orange-800';
    if (hours < 72) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const calculateTimeLeft = (date: Date) => {
    const now = new Date();
    const deadline = new Date(date);
    return Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const handleBulkAssign = (moderatorId: string) => {
    selectedDisputes.forEach(disputeId => {
      onAssignDispute(disputeId, moderatorId);
    });
  };

  const handleBulkStatusUpdate = (status: Dispute['status']) => {
    selectedDisputes.forEach(disputeId => {
      onUpdateStatus(disputeId, status);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dispute Resolution System</h1>
          <p className="text-gray-600">Manage and resolve buyer-seller disputes</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => onExportDisputes('csv')}
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
              <p className="text-sm text-gray-600">Total Disputes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDisputes}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Open</span>
              <span className="font-medium text-orange-600">{stats.openDisputes}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Amount in Dispute</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(stats.totalAmountInDispute)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Escalated</span>
              <span className="font-medium text-red-600">{stats.escalatedCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Resolution Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgResolutionTime}h</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Overdue</span>
              <span className="font-medium text-red-600">{stats.overdueCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolution Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.buyerWinRate}%/{stats.sellerWinRate}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Buyer/Seller Wins</span>
              <span className="font-medium">{stats.resolvedDisputes} resolved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Moderator Status */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Moderator Assignment</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {moderators.map((moderator) => (
            <div key={moderator.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="font-medium text-gray-600">
                      {moderator.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{moderator.name}</div>
                    <div className="text-sm text-gray-600">
                      {moderator.activeDisputes} active dispute{moderator.activeDisputes !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  moderator.activeDisputes === 0 ? 'bg-green-100 text-green-800' :
                  moderator.activeDisputes < 3 ? 'bg-blue-100 text-blue-800' :
                  moderator.activeDisputes < 6 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {moderator.activeDisputes === 0 ? 'Available' : 'Busy'}
                </span>
              </div>
              <button
                onClick={() => handleBulkAssign(moderator.id)}
                disabled={selectedDisputes.size === 0}
                className={`w-full px-3 py-2 rounded text-sm font-medium ${
                  selectedDisputes.size > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Assign {selectedDisputes.size || ''} Selected
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search disputes by ID, auction, buyer, seller, or transaction..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              {/* Sort Controls */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                >
                  <option value="created">Created Date</option>
                  <option value="deadline">Deadline</option>
                  <option value="amount">Amount</option>
                  <option value="severity">Severity</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1 text-gray-600 hover:text-gray-900"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="under_review">Under Review</option>
                    <option value="awaiting_evidence">Awaiting Evidence</option>
                    <option value="escalated">Escalated</option>
                    <option value="resolved">Resolved</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="all">All Severity</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <select
                    value={reasonFilter}
                    onChange={(e) => setReasonFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="all">All Reasons</option>
                    <option value="item_not_received">Item Not Received</option>
                    <option value="item_not_as_described">Item Not as Described</option>
                    <option value="damaged_item">Damaged Item</option>
                    <option value="late_delivery">Late Delivery</option>
                    <option value="fraud">Fraud</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignment</label>
                  <select
                    value={assignedFilter}
                    onChange={(e) => setAssignedFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="all">All</option>
                    <option value="unassigned">Unassigned</option>
                    <option value="assigned">Assigned</option>
                    {moderators.map(mod => (
                      <option key={mod.id} value={mod.id}>
                        {mod.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedDisputes.size > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {selectedDisputes.size} dispute{selectedDisputes.size !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleBulkStatusUpdate('under_review')}
                      className="px-3 py-1.5 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                    >
                      Mark Under Review
                    </button>
                    <button
                      onClick={() => handleBulkStatusUpdate('awaiting_evidence')}
                      className="px-3 py-1.5 text-sm bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
                    >
                      Request Evidence
                    </button>
                    <button
                      onClick={() => handleBulkStatusUpdate('escalated')}
                      className="px-3 py-1.5 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                    >
                      Escalate Selected
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDisputes(new Set())}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear selection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disputes Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedDisputes.size === filteredAndSortedDisputes.length && filteredAndSortedDisputes.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDisputes(new Set(filteredAndSortedDisputes.map(d => d.id)));
                      } else {
                        setSelectedDisputes(new Set());
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dispute Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parties & Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedDisputes.map((dispute) => (
                <tr key={dispute.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedDisputes.has(dispute.id)}
                      onChange={(e) => {
                        const newSet = new Set(selectedDisputes);
                        if (e.target.checked) {
                          newSet.add(dispute.id);
                        } else {
                          newSet.delete(dispute.id);
                        }
                        setSelectedDisputes(newSet);
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {dispute.disputeId}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {dispute.auctionTitle}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Transaction: {dispute.transactionId.slice(0, 12)}...
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        Reason: {getReasonText(dispute.reason)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm text-gray-600">Buyer</div>
                        <div className="text-sm font-medium">{dispute.buyerName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Seller</div>
                        <div className="text-sm font-medium">{dispute.sellerName}</div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(dispute.amount, dispute.currency)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                        {dispute.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(dispute.severity)}`}>
                          {dispute.severity.toUpperCase()}
                        </span>
                      </div>
                      {dispute.assignedToName && (
                        <div className="text-xs text-gray-600 mt-2">
                          Assigned to: {dispute.assignedToName}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Evidence: {dispute.evidence.length} file{dispute.evidence.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-900">
                        Created {formatTimeAgo(dispute.createdAt)}
                      </div>
                      <div className="text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDeadlineColor(dispute.deadline)}`}>
                          {formatDeadline(dispute.deadline)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Updated {formatTimeAgo(dispute.updatedAt)}
                      </div>
                      {dispute.resolution && (
                        <div className="text-xs text-green-600 mt-2">
                          Resolved {formatTimeAgo(dispute.resolution.resolvedAt)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => onViewDispute(dispute.id)}
                        className="flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        View & Respond
                      </button>
                      
                      {dispute.status === 'open' && !dispute.assignedTo && (
                        <select
                          onChange={(e) => onAssignDispute(dispute.id, e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="">Assign to...</option>
                          {moderators.map(mod => (
                            <option key={mod.id} value={mod.id}>
                              {mod.name} ({mod.activeDisputes} active)
                            </option>
                          ))}
                        </select>
                      )}

                      {dispute.status === 'under_review' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => onMakeDecision(dispute.id, 'refund_buyer', dispute.amount)}
                            className="flex-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                            title="Refund Buyer"
                          >
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                            Buyer
                          </button>
                          <button
                            onClick={() => onMakeDecision(dispute.id, 'release_seller', dispute.amount)}
                            className="flex-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                            title="Release to Seller"
                          >
                            <XCircle className="w-3 h-3 inline mr-1" />
                            Seller
                          </button>
                        </div>
                      )}

                      {dispute.status !== 'resolved' && dispute.status !== 'cancelled' && (
                        <button
                          onClick={() => onRequestEvidence(dispute.id, 'buyer', 'proof_of_delivery')}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                        >
                          Request Evidence
                        </button>
                      )}

                      {dispute.status === 'escalated' && (
                        <button
                          onClick={() => onSendMessage(dispute.id, 'Escalation review in progress...')}
                          className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
                        >
                          Send Update
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedDisputes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">⚖️</div>
            <p className="text-gray-600">No disputes found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="font-medium text-gray-900 mb-3">Resolution Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white rounded border">
            <div className="text-xl font-bold text-green-600">{stats.buyerWinRate}%</div>
            <div className="text-sm text-gray-600">Buyer Wins</div>
          </div>
          <div className="text-center p-3 bg-white rounded border">
            <div className="text-xl font-bold text-red-600">{stats.sellerWinRate}%</div>
            <div className="text-sm text-gray-600">Seller Wins</div>
          </div>
          <div className="text-center p-3 bg-white rounded border">
            <div className="text-xl font-bold text-gray-900">
              {filteredAndSortedDisputes.filter(d => calculateTimeLeft(d.deadline) === 0).length}
            </div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
          <div className="text-center p-3 bg-white rounded border">
            <div className="text-xl font-bold text-blue-600">
              {filteredAndSortedDisputes.filter(d => d.status === 'awaiting_evidence').length}
            </div>
            <div className="text-sm text-gray-600">Awaiting Evidence</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            const unassigned = filteredAndSortedDisputes.filter(d => !d.assignedTo);
            unassigned.forEach(d => onAssignDispute(d.id, moderators[0]?.id || ''));
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Assign All Unassigned
        </button>
        <button
          onClick={() => {
            const overdue = filteredAndSortedDisputes.filter(d => calculateTimeLeft(d.deadline) === 0);
            overdue.forEach(d => onUpdateStatus(d.id, 'escalated'));
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Escalate All Overdue
        </button>
        <button
          onClick={() => {
            const awaiting = filteredAndSortedDisputes.filter(d => d.status === 'awaiting_evidence');
            awaiting.forEach(d => onSendMessage(d.id, 'Reminder: Please submit required evidence within 24 hours.'));
          }}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          Send Evidence Reminders
        </button>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>
          Showing {filteredAndSortedDisputes.length} of {disputes.length} disputes
          {searchQuery && ` • Searching: "${searchQuery}"`}
          {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
          {severityFilter !== 'all' && ` • Severity: ${severityFilter}`}
        </p>
        <p className="mt-1">
          Average resolution time: {stats.avgResolutionTime}h • 
          Total amount in dispute: {formatCurrency(stats.totalAmountInDispute, 'USD')}
        </p>
      </div>
    </div>
  );
}
