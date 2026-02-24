'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Calendar, Clock, Phone, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ServiceRequest {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_type: string;
  equipment_type: string;
  equipment_brand: string;
  equipment_model: string;
  preferred_date: string;
  preferred_time: string;
  urgency: string;
  description: string;
  status: string;
  scheduled_date: string;
  created_at: string;
}

export default function ServiceManager({ siteId }: { siteId: string }) {
  const supabase = createClient();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadServiceRequests();
  }, []);

  const loadServiceRequests = async () => {
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });

    if (data) setRequests(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('service_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      loadServiceRequests();
    }
  };

  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : requests.filter(r => r.status === filterStatus);

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    scheduled: requests.filter(r => r.status === 'scheduled').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  if (loading) {
    return <div className="p-8 text-center">Loading service requests...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-700 text-sm mb-1">
            <AlertCircle className="w-4 h-4" />
            Pending
          </div>
          <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-700 text-sm mb-1">
            <Calendar className="w-4 h-4" />
            Scheduled
          </div>
          <div className="text-2xl font-bold text-blue-700">{stats.scheduled}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700 text-sm mb-1">
            <CheckCircle className="w-4 h-4" />
            Completed
          </div>
          <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filterStatus === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          All ({requests.length})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filterStatus === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setFilterStatus('scheduled')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filterStatus === 'scheduled' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Scheduled ({stats.scheduled})
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filterStatus === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Completed ({stats.completed})
        </button>
      </div>

      {/* Service Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
            No service requests found.
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-white border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{request.customer_name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {request.customer_email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {request.customer_phone}
                    </span>
                  </div>
                </div>
                <select
                  value={request.status}
                  onChange={(e) => updateStatus(request.id, e.target.value)}
                  className={`px-3 py-1 rounded-lg font-medium text-sm border-2 ${
                    request.status === 'pending' ? 'border-yellow-300 bg-yellow-50 text-yellow-700' :
                    request.status === 'scheduled' ? 'border-blue-300 bg-blue-50 text-blue-700' :
                    request.status === 'in_progress' ? 'border-purple-300 bg-purple-50 text-purple-700' :
                    request.status === 'completed' ? 'border-green-300 bg-green-50 text-green-700' :
                    'border-red-300 bg-red-50 text-red-700'
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-600">Service Type:</span>
                  <span className="ml-2 font-medium capitalize">{request.service_type.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-gray-600">Equipment:</span>
                  <span className="ml-2 font-medium">{request.equipment_brand} {request.equipment_model}</span>
                </div>
                <div>
                  <span className="text-gray-600">Preferred Date:</span>
                  <span className="ml-2 font-medium">{new Date(request.preferred_date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Urgency:</span>
                  <span className={`ml-2 font-medium capitalize ${
                    request.urgency === 'urgent' ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {request.urgency}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded p-3 text-sm">
                <div className="font-medium text-gray-700 mb-1">Description:</div>
                <div className="text-gray-600">{request.description}</div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  Schedule Appointment
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  View Details
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Contact Customer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
