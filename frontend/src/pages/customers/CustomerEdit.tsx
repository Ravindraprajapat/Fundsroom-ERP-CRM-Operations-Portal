import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { customerService } from '../../services/customer.service';
import type { Customer } from '../../types/customer.types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';

export function CustomerEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const data = await customerService.getById(id!);
        setCustomer({
          customerName: data.customerName,
          businessName: data.businessName,
          mobile: data.mobile,
          email: data.email || '',
          address: data.address,
          customerType: data.customerType,
          status: data.status,
          gstNumber: data.gstNumber || '',
          notes: data.notes || '',
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer?.customerName || !customer?.mobile) {
      setError('Name and mobile are required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await customerService.update(id!, customer);
      navigate(`/customers/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update customer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center h-64 items-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error && !customer) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(`/customers/${id}`)} className="text-gray-600 hover:text-gray-900 mr-4">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-2xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={customer.customerName}
              onChange={(e) => setCustomer(prev => prev ? { ...prev, customerName: e.target.value } : null)}
              placeholder="Enter customer name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <Input
              value={customer.businessName}
              onChange={(e) => setCustomer(prev => prev ? { ...prev, businessName: e.target.value } : null)}
              placeholder="Enter business name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GST Number
            </label>
            <Input
              value={customer.gstNumber || ''}
              onChange={(e) => setCustomer(prev => prev ? { ...prev, gstNumber: e.target.value } : null)}
              placeholder="Enter GST number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile <span className="text-red-500">*</span>
            </label>
            <Input
              value={customer.mobile}
              onChange={(e) => setCustomer(prev => prev ? { ...prev, mobile: e.target.value } : null)}
              placeholder="Enter mobile number"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={customer.email || ''}
              onChange={(e) => setCustomer(prev => prev ? { ...prev, email: e.target.value } : null)}
              placeholder="Enter email address"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={customer.address}
              onChange={(e) => setCustomer(prev => prev ? { ...prev, address: e.target.value } : null)}
              placeholder="Enter address"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Type
            </label>
            <select
              value={customer.customerType}
              onChange={(e) => setCustomer(prev => prev ? { ...prev, customerType: e.target.value as typeof prev.customerType } : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="RETAIL">Retail</option>
              <option value="WHOLESALE">Wholesale</option>
              <option value="DISTRIBUTOR">Distributor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={customer.status}
              onChange={(e) => setCustomer(prev => prev ? { ...prev, status: e.target.value as typeof prev.status } : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="LEAD">Lead</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={customer.notes || ''}
              onChange={(e) => setCustomer(prev => prev ? { ...prev, notes: e.target.value } : null)}
              placeholder="Add notes about this customer"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="secondary" onClick={() => navigate(`/customers/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? <><Loader size="sm" className="mr-2" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
