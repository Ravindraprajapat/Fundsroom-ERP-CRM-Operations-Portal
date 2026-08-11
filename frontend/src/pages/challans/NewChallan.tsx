import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Search } from 'lucide-react';
import { challanService } from '../../services/challan.service';
import { customerService } from '../../services/customer.service';
import { productService } from '../../services/product.service';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import type { Customer } from '../../types/customer.types';
import type { Product } from '../../types/product.types';

interface CartItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  availableStock: number;
}

export function NewChallan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [cRes, pRes] = await Promise.all([
          customerService.getAll({ limit: 100 }),
          productService.getAll({ limit: 100 }),
        ]);
        setCustomers(cRes.data);
        setProducts(pRes.data.filter(p => p.currentStock > 0));
      } catch (err: unknown) {
        console.error('Error fetching data:', err);
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        const errorMessage = e?.response?.data?.message ?? (e?.message ?? undefined);
        setError(errorMessage || (err instanceof Error ? err.message : 'Failed to load customers or products'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCustomers = customers.filter(c =>
    c.customerName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.businessName.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.productName.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const formatCurrency = (value: number | string) => Number(value).toFixed(2);

  const addProductToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      if (existing.quantity < product.currentStock) {
        setCart(cart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.productName,
        sku: product.sku,
        unitPrice: Number(product.unitPrice),
        quantity: 1,
        availableStock: product.currentStock,
      }]);
    }
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(productId);
      return;
    }
    const product = products.find(p => p.id === productId);
    if (product && quantity > product.currentStock) {
      alert(`Cannot exceed available stock: ${product.currentStock}`);
      return;
    }
    setCart(cart.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    ));
  };

  const removeProduct = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!selectedCustomerId) {
      setError('Please select a customer');
      return;
    }
    if (cart.length === 0) {
      setError('Please add at least one product to the cart');
      return;
    }
    
    // Validate quantities
    for (const item of cart) {
      if (item.quantity <= 0) {
        setError(`Quantity must be greater than 0 for ${item.productName}`);
        return;
      }
      if (item.quantity > item.availableStock) {
        setError(`Cannot add more than available stock for ${item.productName} (Available: ${item.availableStock})`);
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);
      await challanService.create({
        customerId: selectedCustomerId,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      navigate('/challans');
    } catch (err: unknown) {
      console.error('Error creating challan:', err);
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = e?.response?.data?.message ?? (e?.message ?? undefined);
      setError(errorMessage || (err instanceof Error ? err.message : 'Failed to create challan. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (Number(item.unitPrice) * item.quantity), 0);
  if (loading) {
    return <div className="flex justify-center h-64 items-center"><Loader size="lg" /></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => navigate('/challans')} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Challans
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Challan</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h2>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                className="pl-10"
              />
            </div>
            {showCustomerDropdown && customerSearch && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredCustomers.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500">No customers found</div>
                ) : (
                  filteredCustomers.map(customer => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => {
                        setSelectedCustomerId(customer.id);
                        setCustomerSearch(`${customer.customerName} (${customer.businessName})`);
                        setShowCustomerDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex flex-col"
                    >
                      <span className="font-medium">{customer.customerName}</span>
                      <span className="text-sm text-gray-500">{customer.businessName}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Products</h2>
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setShowProductDropdown(true);
                }}
                onFocus={() => setShowProductDropdown(true)}
                className="pl-10"
              />
            </div>
            {showProductDropdown && productSearch && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredProducts.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500">No products found</div>
                ) : (
                  filteredProducts.map(product => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addProductToCart(product)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-medium">{product.productName}</span>
                        <span className="text-sm text-gray-500 ml-2">{product.sku}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        ₹{formatCurrency(product.unitPrice)} | Stock: {product.currentStock}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        {cart.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Challan Items</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cart.map(item => (
                  <tr key={item.productId}>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.productName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.sku}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">₹{formatCurrency(item.unitPrice)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="px-2 py-1 border rounded-l hover:bg-gray-50">-</button>
                        <input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)} min="1" max={item.availableStock} className="w-16 text-center border-t border-b px-2 py-1" />
                        <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="px-2 py-1 border rounded-r hover:bg-gray-50">+</button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{formatCurrency(Number(item.unitPrice) * item.quantity)}</td>
                    <td className="px-6 py-4">
                      <button type="button" onClick={() => removeProduct(item.productId)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-right text-sm font-medium text-gray-900">Total Amount:</td>
                  <td colSpan={2} className="px-6 py-4 text-sm font-bold text-gray-900">₹{totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate('/challans')} className="mr-4">Cancel</Button>
          <Button type="submit" disabled={submitting || cart.length === 0 || !selectedCustomerId}>
            {submitting ? <><Loader size="sm" className="mr-2" /> Creating...</> : 'Create Challan'}
          </Button>
        </div>
      </form>
    </div>
  );
}