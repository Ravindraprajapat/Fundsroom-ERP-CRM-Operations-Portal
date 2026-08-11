import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { productService } from '../../services/product.service';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function NewProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    category: '',
    unitPrice: '',
    currentStock: '0',
    minimumStock: '10',
    warehouseLocation: '',
    description: '',
  });

  const validateImageFile = (file: File): string | null => {
    if (!file) return 'No file selected';
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Supported file types are JPG, PNG, and WEBP';
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return 'Image size must be less than 5MB';
    }
    return null;
  };

  const handleFileSelection = (file: File | null) => {
    console.log('Selected file:', file);
    if (!file) {
      setError('No file selected');
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    console.log('File name:', file.name);
    console.log('File type:', file.type);
    console.log('File size:', file.size);
    setError(null);
    setSuccessMessage(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName || !formData.sku) {
      setError('Product name and SKU are required');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const product = await productService.create({
        ...formData,
        unitPrice: parseFloat(formData.unitPrice),
        currentStock: parseInt(formData.currentStock, 10),
        minimumStock: parseInt(formData.minimumStock, 10),
      });

      if (imageFile) {
        console.log('Uploading image for product:', product.id);
        const uploadResult = await productService.uploadImage(product.id, imageFile);
        console.log('Upload result:', uploadResult);
        setSuccessMessage('Product created and image uploaded successfully');
      } else {
        setSuccessMessage('Product created successfully');
      }

      navigate('/products');
    } catch (err: any) {
      console.error('Product create/upload error:', err);
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/products')} className="text-gray-600 hover:text-gray-900 mr-4">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
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
              Product Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.productName}
              onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
              placeholder="Enter product name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.sku}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              placeholder="Enter SKU"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <Input
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Enter category"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit Price <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Stock
            </label>
            <Input
              type="number"
              value={formData.currentStock}
              onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Stock Level
            </label>
            <Input
              type="number"
              value={formData.minimumStock}
              onChange={(e) => setFormData(prev => ({ ...prev, minimumStock: e.target.value }))}
              placeholder="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warehouse Location
            </label>
            <Input
              value={formData.warehouseLocation}
              onChange={(e) => setFormData(prev => ({ ...prev, warehouseLocation: e.target.value }))}
              placeholder="e.g., Aisle 1, Shelf B"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter product description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Photo
            </label>
            <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <label className="cursor-pointer rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Choose Image
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      handleFileSelection(file);
                      e.target.value = '';
                    }}
                  />
                </label>
                {imageFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-500">Upload a product image to display in product listings and details.</p>
              {imagePreview && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <img src={imagePreview} alt="Product preview" className="h-48 w-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {successMessage}
          </div>
        )}
        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="secondary" onClick={() => navigate('/products')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader size="sm" className="mr-2" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save Product</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
