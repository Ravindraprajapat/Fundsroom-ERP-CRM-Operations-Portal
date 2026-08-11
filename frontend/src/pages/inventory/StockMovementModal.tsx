import { useState, useEffect } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, Package, AlertTriangle } from 'lucide-react';
import { stockService } from '../../services/stock.service';
import { productService } from '../../services/product.service';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import type { Product } from '../../types/product.types';
import { useAuth } from '../../hooks/useAuth';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'IN' | 'OUT';
  productId?: string;
}

export function StockMovementModal({
  isOpen,
  onClose,
  onSuccess,
  type,
  productId: initialProductId,
}: StockMovementModalProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState(initialProductId || '');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    quantity: '',
    reason: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      if (initialProductId) {
        setSelectedProductId(initialProductId);
      }
    } else {
      resetForm();
    }
  }, [isOpen, initialProductId]);

  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [selectedProductId, products]);

  const loadProducts = async () => {
    try {
      const response = await productService.getAll({ limit: 100 });
      setProducts(response.data);
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
    }
  };

  const resetForm = () => {
    setError(null);
    setSelectedProductId(initialProductId || '');
    setSelectedProduct(null);
    setFormData({ quantity: '', reason: '' });
  };

  const validateForm = (): string | null => {
    if (!selectedProductId) return 'Please select a product';
    if (!formData.quantity || parseInt(formData.quantity) <= 0) return 'Quantity must be greater than 0';
    if (!formData.reason.trim()) return 'Reason is required';
    
    if (type === 'OUT' && selectedProduct) {
      if (parseInt(formData.quantity) > selectedProduct.currentStock) {
        return `Cannot remove more than available stock (${selectedProduct.currentStock})`;
      }
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (type === 'IN') {
        await stockService.stockIn(selectedProductId, parseInt(formData.quantity), formData.reason);
      } else {
        await stockService.stockOut(selectedProductId, parseInt(formData.quantity), formData.reason);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating stock movement:', err);
      setError(err.response?.data?.message || 'Failed to process stock movement');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const canManageStock = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';
  if (!canManageStock) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Access Denied</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-gray-600">Only Admin and Warehouse roles can manage stock.</p>
          <div className="mt-6 flex justify-end">
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            {type === 'IN' ? (
              <ArrowUpCircle className="h-6 w-6 text-green-600" />
            ) : (
              <ArrowDownCircle className="h-6 w-6 text-red-600" />
            )}
            <h2 className="text-xl font-bold">
              Stock {type === 'IN' ? 'IN' : 'OUT'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center mb-4">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!!initialProductId}
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.productName} ({product.sku}) - ?{product.unitPrice}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedProduct && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Current Stock</p>
                    <p className="text-lg font-bold text-gray-900">{selectedProduct.currentStock}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Minimum Stock</p>
                    <p className="text-lg font-bold text-gray-900">{selectedProduct.minimumStock}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Unit Price</p>
                    <p className="text-lg font-bold text-gray-900">?{selectedProduct.unitPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-lg font-bold text-gray-900">{selectedProduct.warehouseLocation}</p>
                  </div>
                </div>
                {selectedProduct.currentStock <= selectedProduct.minimumStock && (
                  <div className="mt-2 flex items-center text-yellow-700 text-sm">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Stock is at or below minimum level
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="Enter quantity"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder={type === 'IN' ? 'e.g., Purchase order #123, Return from customer' : 'e.g., Sales order #456, Damaged goods'}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              variant={type === 'IN' ? 'success' : 'danger'}
            >
              {submitting ? (
                <><Loader size="sm" className="mr-2" /> Processing...</>
              ) : (
                <>
                  {type === 'IN' ? (
                    <><ArrowUpCircle className="h-4 w-4 mr-2" /> Add Stock</>
                  ) : (
                    <><ArrowDownCircle className="h-4 w-4 mr-2" /> Remove Stock</>
                  )}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
