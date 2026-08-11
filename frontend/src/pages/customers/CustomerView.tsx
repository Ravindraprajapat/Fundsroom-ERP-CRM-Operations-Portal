import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Phone, Mail, MapPin, Building, User, Hash } from 'lucide-react';
import { customerService } from '../../services/customer.service';
import type { Customer } from '../../types/customer.types';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { ErrorState } from '../../components/common/ErrorState';
import { StatusBadge } from '../../components/common/StatusBadge';

export function CustomerView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const data = await customerService.getById(id!);
        setCustomer(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load customer');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomer();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center h-64 items-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !customer) {
    return <ErrorState message={error || 'Customer not found'} onRetry={() => navigate('/customers')} />;
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/customers')} className="text-gray-600 hover:text-gray-900 mr-4">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.customerName}</h1>
            <p className="text-gray-600">{customer.businessName}</p>
          </div>
          <Button variant="secondary" onClick={() => navigate(`/customers/${customer.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Customer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Customer Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{customer.customerName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Business Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{customer.businessName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Mobile
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{customer.mobile}</dd>
              </div>
              {customer.email && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.email}</dd>
                </div>
              )}
              {customer.gstNumber && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Hash className="h-4 w-4 mr-2" />
                    GST Number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.gstNumber}</dd>
                </div>
              )}
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Address
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{customer.address}</dd>
              </div>
            </dl>
          </div>

          {customer.notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Customer Type</dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {customer.customerType}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={customer.status} />
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(customer.updatedAt).toLocaleDateString()}
                </dd>
              </div>
              {customer.followUpDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Follow-up Date</dt>
                  <dd className="mt-1 text-sm text-orange-600 font-medium">
                    {new Date(customer.followUpDate).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => navigate(`/customers/${customer.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Customer
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              {customer.email && (
                <Button variant="secondary" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
