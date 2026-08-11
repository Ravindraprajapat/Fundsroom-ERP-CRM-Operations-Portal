import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { customerService } from '../../services/customer.service';
import type { Customer } from '../../types/customer.types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { StatusBadge } from '../../components/common/StatusBadge';

export function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customerService.getAll({ page, limit: 20, search });
      setCustomers(response.data);
      setTotal(response.total);
    } catch (err) {
      console.error(err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const deleteCustomer = async (id: string) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      setLoading(true);
      await customerService.delete(id);
      await fetchCustomers();
    } catch {
      alert('Failed to delete customer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => { fetchCustomers(); }, 0);
    return () => clearTimeout(t);
  }, [fetchCustomers]);

  if (loading && page === 1) return <div className="flex justify-center h-64 items-center"><Loader size="lg" /></div>;
  if (error) return <ErrorState message={error} onRetry={fetchCustomers} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <Button onClick={() => navigate('/customers/new')}><Plus className="h-4 w-4 mr-2" />Add Customer</Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        {customers.length === 0 ? <EmptyState message="No customers found" /> : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.customerName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{c.businessName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{c.mobile}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{c.customerType}</td>
                  <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                  <td className="px-6 py-4 text-sm">
                    <button onClick={() => navigate(`/customers/${c.id}`)} className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button onClick={() => navigate(`/customers/${c.id}/edit`)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button onClick={() => deleteCustomer(c.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {total > 20 && (
          <div className="px-6 py-4 border-t flex justify-between items-center">
            <span className="text-sm text-gray-700">Page {page}</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}