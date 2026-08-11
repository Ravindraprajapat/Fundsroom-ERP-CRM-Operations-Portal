import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { productService } from '../../services/product.service';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    productName: '', sku: '', category: '', unitPrice: '', currentStock: '0', minimumStock: '0', warehouseLocation: '', description: '',
  });

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const p = await productService.getById(id);
        // response is the product object
        const product = p;
        setFormData({
          productName: product.productName || '',
          sku: product.sku || '',
          category: product.category || '',
          unitPrice: String(product.unitPrice ?? ''),
          currentStock: String(product.currentStock ?? 0),
          minimumStock: String(product.minimumStock ?? 0),
          warehouseLocation: product.warehouseLocation || '',
          description: '',
        });
      } catch (e) {
        console.error(e);
        setError('Failed to load product');
      } finally { setLoading(false); }
    };
    void load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      await productService.update(id, {
        productName: formData.productName,
        sku: formData.sku,
        category: formData.category,
        unitPrice: parseFloat(formData.unitPrice),
        currentStock: parseInt(formData.currentStock, 10),
        minimumStock: parseInt(formData.minimumStock, 10),
        warehouseLocation: formData.warehouseLocation,
      });
      navigate('/products');
    } catch (err) {
      console.error(err);
      setError('Failed to update product');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><Loader size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/products')} className="text-gray-600 hover:text-gray-900 mr-4">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-2xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name <span className="text-red-500">*</span></label>
            <Input value={formData.productName} onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SKU <span className="text-red-500">*</span></label>
            <Input value={formData.sku} onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <Input value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price <span className="text-red-500">*</span></label>
            <Input type="number" step="0.01" value={formData.unitPrice} onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Stock</label>
            <Input type="number" value={formData.currentStock} onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Stock</label>
            <Input type="number" value={formData.minimumStock} onChange={(e) => setFormData(prev => ({ ...prev, minimumStock: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse Location</label>
            <Input value={formData.warehouseLocation} onChange={(e) => setFormData(prev => ({ ...prev, warehouseLocation: e.target.value }))} />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="secondary" onClick={() => navigate('/products')}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? <><Loader size="sm" className="mr-2" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save</>}</Button>
        </div>
      </form>
    </div>
  );
}
