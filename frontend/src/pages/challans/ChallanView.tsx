import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Hash, Package, Users } from 'lucide-react';
import { challanService } from '../../services/challan.service';
import type { Challan } from '../../types/challan.types';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { ErrorState } from '../../components/common/ErrorState';
import { StatusBadge } from '../../components/common/StatusBadge';

export function ChallanView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallan = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await challanService.getById(id!);
        setChallan(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load challan details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchChallan();
    }
  }, [id]);

  const handleDownloadInvoice = async () => {
    if (!id) return;
    try {
      await challanService.downloadInvoicePDF(id);
    } catch (err: any) {
      console.error('Error downloading invoice:', err);
      alert(err.response?.data?.message || 'Failed to download invoice PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center h-64 items-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !challan) {
    return <ErrorState message={error || 'Challan not found'} onRetry={() => navigate('/challans')} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/challans')} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Challan {challan.challanNumber}</h1>
            <p className="text-sm text-gray-600">Created on {new Date(challan.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {challan.status === 'CONFIRMED' && (
            <Button variant="secondary" onClick={handleDownloadInvoice}>
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
                <p className="text-sm text-gray-500">Challan information and order details</p>
              </div>
              <StatusBadge status={challan.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-100 p-4 bg-gray-50">
                <div className="text-sm text-gray-500">Payment Status</div>
                <div className="mt-1 text-base font-semibold text-gray-900">{challan.paymentStatus || 'UNPAID'}</div>
              </div>
              <div className="rounded-lg border border-gray-100 p-4 bg-gray-50">
                <div className="text-sm text-gray-500">Total Items</div>
                <div className="mt-1 text-base font-semibold text-gray-900">{challan.items?.length ?? 0}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Customer</h2>
              <Button variant="secondary" onClick={() => navigate(`/customers/${challan.customerId}`)}>
                <Users className="h-4 w-4 mr-2" />
                View Customer
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Name</div>
                <div className="text-base font-semibold text-gray-900">{challan.customer?.customerName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Business</div>
                <div className="text-base text-gray-900">{challan.customer?.businessName}</div>
              </div>
              {challan.customer?.mobile && (
                <div>
                  <div className="text-sm text-gray-500">Mobile</div>
                  <div className="text-base text-gray-900">{challan.customer.mobile}</div>
                </div>
              )}
              {challan.customer?.email && (
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="text-base text-gray-900">{challan.customer.email}</div>
                </div>
              )}
              {challan.customer?.address && (
                <div>
                  <div className="text-sm text-gray-500">Address</div>
                  <div className="text-base text-gray-900">{challan.customer.address}</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
            <div className="space-y-3">
              {challan.items?.length ? (
                <div className="space-y-4">
                  {challan.items.map((item) => (
                    <div key={item.id} className="rounded-lg border border-gray-100 p-4">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="font-medium text-gray-900">{item.productName}</div>
                        <div>{item.sku}</div>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-gray-700">
                        <div>
                          <div className="font-medium">Qty</div>
                          <div>{item.quantity}</div>
                        </div>
                        <div>
                          <div className="font-medium">Unit Price</div>
                          <div>₹{Number(item.unitPrice).toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="font-medium">Total</div>
                          <div>₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No items added to this challan.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Hash className="h-4 w-4" />
                Challan ID: {challan.id}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package className="h-4 w-4" />
                Total Quantity: {challan.totalQuantity}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                Created by: {challan.createdByUser?.name || 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
