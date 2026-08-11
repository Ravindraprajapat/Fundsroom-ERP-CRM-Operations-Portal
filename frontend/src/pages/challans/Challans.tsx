import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download } from 'lucide-react';
import { challanService } from '../../services/challan.service';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { StatusBadge } from '../../components/common/StatusBadge';
import type { Challan } from '../../types/challan.types';

export function Challans() {
  const navigate = useNavigate();
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'DRAFT' | 'CONFIRMED' | 'CANCELLED' | ''>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'UNPAID' | 'PAID' | ''>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const cRes = await challanService.getAll({ page, limit: 20, search, status: statusFilter, paymentStatus: paymentStatusFilter || undefined });
      setChallans(cRes.data);
      setTotal(cRes.total);
    } catch (err: any) {
      console.error('Error fetching challans:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load challans';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, search, statusFilter, paymentStatusFilter]);

  if (loading && page === 1) return <div className="flex justify-center h-64 items-center"><Loader size="lg" /></div>;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  const handleConfirm = async (id: string) => {
    if (!confirm('Confirm this challan? This will deduct stock from inventory.')) return;
    try {
      await challanService.confirm(id);
      fetchData();
    } catch (err: any) {
      console.error('Error confirming challan:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to confirm challan';
      alert(errorMessage);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this challan? This action cannot be undone.')) return;
    try {
      await challanService.cancel(id);
      fetchData();
    } catch (err: any) {
      console.error('Error cancelling challan:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to cancel challan';
      alert(errorMessage);
    }
  };

  // const handleMarkAsPaid = async (id: string) => {
  //   if (!confirm('Mark this challan as paid?')) return;
  //   try {
  //     await challanService.markAsPaid(id);
  //     fetchData();
  //   } catch (err: any) {
  //     console.error('Error marking challan as paid:', err);
  //     const errorMessage = err.response?.data?.message || err.message || 'Failed to mark challan as paid';
  //     alert(errorMessage);
  //   }
  // };

  const handleDownloadInvoice = async (id: string) => {
    try {
      await challanService.downloadInvoicePDF(id);
    } catch (err: any) {
      console.error('Error downloading invoice:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to download invoice PDF';
      alert(errorMessage);
    }
  };

  // const handleDownloadChallan = async (id: string) => {
  //   try {
  //     await challanService.downloadChallanPDF(id);
  //   } catch (err: any) {
  //     console.error('Error downloading challan:', err);
  //     const errorMessage = err.response?.data?.message || err.message || 'Failed to download challan PDF';
  //     alert(errorMessage);
  //   }
  // };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sales Challans</h1>
        <Button onClick={() => navigate('/challans/new')}><Plus className="h-4 w-4 mr-2" />New Challan</Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search challans..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="px-3 py-2 border rounded-lg">
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value as typeof paymentStatusFilter)} className="px-3 py-2 border rounded-lg">
              <option value="">All Payment Status</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
        </div>

        {challans.length === 0 ? <EmptyState message="No challans found" /> : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Challan #</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {challans.map((c) => (<tr key={c.id} className="hover:bg-gray-50"><td className="px-6 py-4 text-sm font-medium text-gray-900">{c.challanNumber}</td><td className="px-6 py-4 text-sm text-gray-900">{c.customer?.customerName || c.customerId}</td><td className="px-6 py-4 text-sm text-gray-900">{c.totalQuantity}</td><td className="px-6 py-4"><StatusBadge status={c.status} /></td><td className="px-6 py-4"><StatusBadge status={c.paymentStatus || "UNPAID"} /></td><td className="px-6 py-4 text-sm text-gray-900">{new Date(c.createdAt).toLocaleDateString()}</td><td className="px-6 py-4 text-sm"><button onClick={() => navigate(`/challans/${c.id}`)} className="text-blue-600 hover:text-blue-900 mr-3">View</button>{c.status === 'CONFIRMED' && <button onClick={() => handleDownloadInvoice(c.id)} className="text-green-600 hover:text-green-900 mr-3"><Download className="h-4 w-4 inline" /> Invoice</button>}{c.status === 'DRAFT' && <><button onClick={() => handleConfirm(c.id)} className="text-green-600 hover:text-green-900 mr-3">Confirm</button><button onClick={() => handleCancel(c.id)} className="text-red-600 hover:text-red-900">Cancel</button></>}</td></tr>))}
            </tbody>
          </table>
        )}

        {total > 20 && (
          <div className="px-6 py-4 border-t flex justify-between items-center">
            <span className="text-sm text-gray-700">Page {page}</span>
            <div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button><Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}>Next</Button></div>
          </div>
        )}
      </div>
    </div>
  );
}