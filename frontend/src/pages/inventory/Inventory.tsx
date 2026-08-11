import { useEffect, useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { stockService } from '../../services/stock.service';
import { productService } from '../../services/product.service';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

import { StockMovementModal } from './StockMovementModal';
import type { StockMovement } from '../../types/stock.types';
import type { Product } from '../../types/product.types';
import { useAuth } from '../../hooks/useAuth';

export function Inventory() {
  const { user } = useAuth();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, pRes] = await Promise.all([
        stockService.getMovements({ limit: 50 }), 
        productService.getAll({ limit: 100 })
      ]);
      setMovements(mRes.data);
      setProducts(pRes.data);
    } catch (err: any) {
      console.error('Error loading inventory:', err);
      setError(err.response?.data?.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleStockIn = (productId?: string) => {
    setSelectedProductId(productId);
    setShowStockInModal(true);
  };

  const handleStockOut = (productId?: string) => {
    setSelectedProductId(productId);
    setShowStockOutModal(true);
  };

  const handleModalSuccess = () => {
    fetchData(); // Refresh data after successful movement
  };

  if (loading) {
    return (
      <div className="flex justify-center h-64 items-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  const canManageStock = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';
  const lowStockCount = products.filter(p => p.currentStock <= p.minimumStock).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600 mt-1">
            Manage stock levels and track movements
            {lowStockCount > 0 && (
              <span className="ml-2 text-yellow-600 font-medium">
                • {lowStockCount} low stock item{lowStockCount > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        {canManageStock && (
          <div className="flex gap-2">
            <Button variant="success" onClick={() => handleStockIn()}>
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Stock IN
            </Button>
            <Button variant="danger" onClick={() => handleStockOut()}>
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Stock OUT
            </Button>
          </div>
        )}

      {/* Products with low stock */}
      {products.filter(p => p.currentStock <= p.minimumStock).length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            Low Stock Alerts
          </h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Minimum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products
                  .filter(p => p.currentStock <= p.minimumStock)
                  .map((product) => (
                    <tr key={product.id} className="bg-yellow-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.productName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.sku}</td>
                      <td className="px-6 py-4 text-sm text-red-600 font-medium">{product.currentStock}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.minimumStock}</td>
                      <td className="px-6 py-4 text-sm">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleStockIn(product.id)}
                        >
                          <ArrowUpCircle className="h-3 w-3 mr-1" />
                          Add Stock
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>

      {/* Recent Stock Movements */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Stock Movements</h2>
          <Button variant="secondary" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        {movements.length === 0 ? (
          <EmptyState message="No stock movements recorded yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.slice(0, 10).map((movement) => {
                  const product = products.find(p => p.id === movement.productId);
                  return (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(movement.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product ? `${product.productName} (${product.sku})` : 'Unknown Product'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            movement.type === 'IN'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {movement.type === 'IN' ? (
                            <ArrowUpCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownCircle className="h-3 w-3 mr-1" />
                          )}
                          {movement.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {movement.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {movement.reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Movement Modals */}
      <StockMovementModal
        isOpen={showStockInModal}
        onClose={() => {
          setShowStockInModal(false);
          setSelectedProductId(undefined);
        }}
        onSuccess={handleModalSuccess}
        type="IN"
        productId={selectedProductId}
      />
      <StockMovementModal
        isOpen={showStockOutModal}
        onClose={() => {
          setShowStockOutModal(false);
          setSelectedProductId(undefined);
        }}
        onSuccess={handleModalSuccess}
        type="OUT"
        productId={selectedProductId}
      />
    </div>
  );
}