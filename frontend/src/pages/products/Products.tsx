import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, AlertTriangle, Upload, X } from 'lucide-react';
import { productService } from '../../services/product.service';
import type { Product } from '../../types/product.types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [pendingUploadProductId, setPendingUploadProductId] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productService.getAll({ page, limit: 20, search });
      setProducts(response.data);
      setTotal(response.total);
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const load = async () => {
      await fetchProducts();
    };
    void load();
  }, [fetchProducts]);

  const loadImageUrls = useCallback(async () => {
    const newUrls: Record<string, string> = {};
    await Promise.all(
      products
        .filter((product) => product.imageUrl && !imageUrls[product.imageUrl])
        .map(async (product) => {
            if (!product.imageUrl) return;
            const key = product.imageUrl;
            // If the stored imageUrl is already a full URL (presigned or otherwise), use it directly
            if (key.startsWith('http')) {
              newUrls[key] = key;
              return;
            }

            setImageLoading((prev) => ({ ...prev, [key]: true }));
            try {
              const url = await productService.getImageUrl(key);
              newUrls[key] = url;
            } catch (err) {
              console.error('Failed to get presigned URL for', key, err);
            } finally {
              setImageLoading((prev) => ({ ...prev, [key]: false }));
            }
          })
    );

    if (Object.keys(newUrls).length > 0) {
      setImageUrls((prev) => ({ ...prev, ...newUrls }));
    }
  }, [products, imageUrls]);

  useEffect(() => {
    if (products.length > 0) {
      const load = async () => {
        await loadImageUrls();
      };
      void load();
    }
  }, [products, loadImageUrls]);

  const startUpload = (productId: string) => {
    setPendingUploadProductId(productId);
    fileInputRef.current?.click();
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      setLoading(true);
      await productService.delete(id);
      await fetchProducts();
    } catch {
      alert('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (productId: string | null, file: File | null) => {
    if (!productId || !file) {
      setPendingUploadProductId(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      setPendingUploadProductId(null);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      alert('Image size must be less than 5MB');
      setPendingUploadProductId(null);
      return;
    }

    try {
      setUploadingId(productId);
      const uploadResult = await productService.uploadImage(productId, file);

      // After upload, fetch the latest product record to get the stored image key
      let key: string | undefined;
      try {
        const updated = await productService.getById(productId);
        key = updated?.imageUrl;
      } catch (err) {
        console.warn('Could not fetch updated product after upload', err);
      }

      // If product.imageUrl is already a full URL, use it directly
      if (key && key.startsWith('http')) {
        setImageUrls((prev) => ({ ...prev, [key]: key }));
      } else {
        // prefer presignedUrl from upload response when available
        let presignedUrl = uploadResult?.presignedUrl;
        if (!presignedUrl && key) {
          try {
            presignedUrl = await productService.getImageUrl(key);
          } catch (err) {
            console.error('Failed to get presigned URL after upload for', key, err);
          }
        }

        if (key && presignedUrl) {
          setImageUrls((prev) => ({ ...prev, [key]: presignedUrl }));
        }
      }

      // Refresh products list to ensure DB state is current
      await fetchProducts();
    } catch {
      alert('Failed to upload image');
    } finally {
      setUploadingId(null);
      setPendingUploadProductId(null);
    }
  };

  if (loading && page === 1) return <div className="flex justify-center h-64 items-center"><Loader size="lg" /></div>;
  if (error) return <ErrorState message={error} onRetry={fetchProducts} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button onClick={() => navigate('/products/new')}><Plus className="h-4 w-4 mr-2" />Add Product</Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            handleImageUpload(pendingUploadProductId, file);
            e.target.value = '';
          }}
        />

        {products.length === 0 ? <EmptyState message="No products found" /> : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((p) => {
                const lowStock = p.currentStock <= p.minimumStock;
                const key = p.imageUrl ?? '';
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      {uploadingId === p.id ? (
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <Loader size="sm" className="animate-spin" />
                          Uploading...
                        </div>
                      ) : (
                        <button
                          onClick={() => startUpload(p.id)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-900 text-sm"
                        >
                          <Upload className="h-4 w-4" />
                          Upload
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                          {p.imageUrl ? (
                            imageUrls[key] ? (
                              <img
                                src={imageUrls[key]}
                                alt={p.productName}
                                className="h-full w-full object-cover"
                                onError={() => {
                                  console.error('IMAGE LOAD FAILED:', {
                                    imageKey: key,
                                    imageUrl: imageUrls[key],
                                  });
                                }}
                              />
                            ) : imageLoading[key] ? (
                              <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                                Loading...
                              </div>
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                                Loading...
                              </div>
                            )
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                              No image
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{p.productName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{p.sku}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{p.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">₹{p.unitPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center">
                        <span className={lowStock ? 'text-red-600 font-medium' : 'text-gray-900'}>{p.currentStock}</span>
                        {lowStock && <AlertTriangle className="h-4 w-4 text-red-500 ml-1" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{p.minimumStock}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${lowStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {lowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-3">
                      <button onClick={() => navigate(`/products/${p.id}/edit`)} className="text-blue-600 hover:text-blue-900">Edit</button>
                      <button onClick={() => deleteProduct(p.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                );
              })}
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

      {/* Image Preview Modal */}
      {viewingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="h-8 w-8" />
            </button>
            <img src={viewingImage} alt="Product" className="max-w-full max-h-[80vh] object-contain rounded" />
          </div>
        </div>
      )}
    </div>
  );
}