import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { customerService } from '../../services/customer.service';
import { productService } from '../../services/product.service';
import { challanService } from '../../services/challan.service';
import type { Product } from '../../types/product.types';
import type { Challan } from '../../types/challan.types';
import { Users, Package, FileText, AlertTriangle } from 'lucide-react';
import { Loader } from '../../components/common/Loader';
import { ErrorState } from '../../components/common/ErrorState';

interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  totalChallans: number;
  draftChallans: number;
  confirmedChallans: number;
}

export function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if not authenticated
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        // Only fetch data the current user has access to
        const userRole = user?.role;
        const canAccessCustomers = ['ADMIN', 'SALES', 'ACCOUNTS'].includes(userRole || '');
        const canAccessProducts = ['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'].includes(userRole || '');
        const canAccessChallans = ['ADMIN', 'SALES', 'ACCOUNTS'].includes(userRole || '');
        
        const customersPromise = canAccessCustomers ? customerService.getAll({ limit: 1 }) : null;
        const productsPromise = canAccessProducts ? productService.getAll({ limit: 100 }) : null;
        const challansPromise = canAccessChallans ? challanService.getAll({ limit: 100 }) : null;

        const [customers, products, challans] = await Promise.all([
          customersPromise,
          productsPromise,
          challansPromise,
        ]);

        const lowStock = (products?.data as Product[] | undefined)?.filter(p => p.currentStock <= p.minimumStock).length || 0;

        setStats({
          totalCustomers: customers?.total || 0,
          totalProducts: products?.total || 0,
          lowStockProducts: lowStock,
          totalChallans: challans?.total || 0,
          draftChallans: (challans?.data as Challan[] | undefined)?.filter(c => c.status === 'DRAFT').length || 0,
          confirmedChallans: (challans?.data as Challan[] | undefined)?.filter(c => c.status === 'CONFIRMED').length || 0,
        });
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, isAuthenticated]);

  // Show login message if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Log In</h2>
          <p className="text-gray-600">You need to be logged in to view the dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  const cards = [
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: <Users className="h-8 w-8 text-[#FF5A1F]" />,
      bgColor: 'bg-[#FFF1EB]',
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: <Package className="h-8 w-8 text-[#16A34A]" />,
      bgColor: 'bg-[#EAF7EE]',
    },
    {
      title: 'Low Stock Items',
      value: stats?.lowStockProducts || 0,
      icon: <AlertTriangle className="h-8 w-8 text-[#D97706]" />,
      bgColor: 'bg-[#FFF7E6]',
      alert: stats?.lowStockProducts && stats.lowStockProducts > 0,
    },
    {
      title: 'Total Challans',
      value: stats?.totalChallans || 0,
      icon: <FileText className="h-8 w-8 text-[#0B3B3A]" />,
      bgColor: 'bg-[#EAF7EE]',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-[#1F2933]">Dashboard</h1>
        <p className="text-sm md:text-base text-[#5F6B76] mt-1">Overview of your business operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                {card.icon}
              </div>
            </div>
            {card.alert && (
              <div className="mt-4 flex items-center text-yellow-700 text-sm">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Requires attention
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md border border-[#E5E7EB]">
        <div className="px-4 md:px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-base md:text-lg font-semibold text-[#1F2933]">Quick Stats</h2>
        </div>
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="p-3 md:p-4 bg-[#F8F8F7] rounded-lg">
              <p className="text-xs md:text-sm text-[#5F6B76]">Draft Challans</p>
              <p className="text-xl md:text-2xl font-bold text-[#1F2933]">{stats?.draftChallans || 0}</p>
            </div>
            <div className="p-3 md:p-4 bg-[#F8F8F7] rounded-lg">
              <p className="text-xs md:text-sm text-[#5F6B76]">Confirmed Challans</p>
              <p className="text-xl md:text-2xl font-bold text-[#1F2933]">{stats?.confirmedChallans || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}