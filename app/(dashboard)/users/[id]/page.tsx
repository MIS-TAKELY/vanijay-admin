'use client';

import { useQuery, gql } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { clsx } from 'clsx';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    User as UserIcon,
    ShoppingCart,
    Heart,
    Package,
    XCircle,
    Store,
    MapPin,
    Phone,
    Mail,
    ShoppingBag,
    DollarSign,
    RotateCcw,
    CreditCard,
    Briefcase,
    FileText,
    CheckCircle2,
    Calendar,
    Globe,
    ChevronDown,
    ChevronRight,
    Info,
    Activity
} from 'lucide-react';


const GET_USER_DETAILS = gql`
  query GetUserDetails($userId: String!) {
    user(id: $userId) {
      id
      name
      email
      role
      roles
      isSeller
      createdAt
    }
    userDetails(userId: $userId) {
      sales
      revenue
      inCartCount
      inWishlistCount
      returnedCount
    }
    sellerProducts(sellerId: $userId) {
      id
      name
      price
      stock
      status
      category
      createdAt
    }
    buyerDetails(userId: $userId) {
      profile {
        id
        name
        email
        username
        phone
        avatarImageUrl
        createdAt
        addresses {
          id
          type
          line1
          line2
          city
          state
          country
          postalCode
          isDefault
        }
      }
      cartItems {
        id
        productId
        productName
        productImage
        variantName
        price
        quantity
      }
      wishlistItems {
        id
        productId
        productName
        productImage
        price
      }
      orders {
        id
        orderNumber
        status
        total
        itemCount
        createdAt
      }
      cancelledOrders {
        id
        orderNumber
        productName
        reason
        description
        createdAt
      }
    }
    sellerFullDetails(userId: $userId) {
        profile {
            id
            shopName
            slug
            logo
            banner
            description
            tagline
            businessName
            businessRegNo
            businessType
            phone
            altPhone
            email
            returnPolicy
            shippingPolicy
            about
            verificationStatus
            isActive
            averageRating
            totalReviews
            totalSales
            createdAt
        }
        orders {
            id
            orderNumber
            status
            total
            subtotal
            tax
            shippingFee
            commission
            createdAt
            buyerName
            items {
                id
                productName
                variantName
                quantity
                unitPrice
                totalPrice
            }
        }
        payouts {
            id
            amount
            currency
            status
            scheduledFor
            processedAt
            createdAt
        }
    }
  }
`;


export default function UserDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data, loading, error } = useQuery(GET_USER_DETAILS, {
        variables: { userId: id as string },
    });

    const [activeTab, setActiveTab] = useState('profile');

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading secure profile data...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
                <h3 className="text-lg font-bold mb-2">Internal Sync Error</h3>
                <p className="text-sm opacity-90">{error.message}</p>
                <Button variant="outline" className="mt-4 border-red-300 hover:bg-red-100" onClick={() => window.location.reload()}>
                    Retry Connection
                </Button>
            </div>
        </div>
    );

    const user = data?.user;
    const buyerData = data?.buyerDetails;
    const sellerStats = data?.userDetails;
    const sellerProducts = data?.sellerProducts || [];
    const sellerFullDetails = data?.sellerFullDetails;

    const tabCategories = [
        {
            title: 'Registry Hub',
            tabs: [
                { id: 'profile', label: 'User Profile', icon: UserIcon, roles: ['BUYER', 'SELLER'] },
                { id: 'shop', label: 'Shop Profile', icon: Store, roles: ['SELLER'] },
            ]
        },
        {
            title: 'Logistics (Buyer)',
            tabs: [
                { id: 'cart', label: 'Cart Items', icon: ShoppingCart, roles: ['BUYER'] },
                { id: 'wishlist', label: 'Wishlist', icon: Heart, roles: ['BUYER'] },
                { id: 'orders', label: 'Buyer Orders', icon: Package, roles: ['BUYER'] },
                { id: 'cancellations', label: 'Disputes', icon: XCircle, roles: ['BUYER'] },
            ]
        },
        {
            title: 'Operations (Seller)',
            tabs: [
                { id: 'products', label: 'Inventory', icon: ShoppingBag, roles: ['SELLER'] },
                { id: 'seller_orders', label: 'Store Orders', icon: FileText, roles: ['SELLER'] },
                { id: 'payouts', label: 'Payout History', icon: CreditCard, roles: ['SELLER'] },
            ]
        }
    ];

    const getVisibleTabs = (category: any) =>
        category.tabs.filter((tab: any) => tab.roles.some((role: any) => user?.roles?.includes(role)));

    return (
        <div className="space-y-8 p-6 lg:p-10 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/30 border border-primary/20 flex items-center justify-center overflow-hidden shadow-inner relative group">
                        {buyerData?.profile?.avatarImageUrl ? (
                            <img src={buyerData.profile.avatarImageUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="h-10 w-10 text-primary" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button size="icon" variant="ghost" className="text-white">
                                <FileText className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{user?.name}</h1>
                            {user?.roles?.map((role: string) => (
                                <span key={role} className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                                    {role}
                                </span>
                            ))}
                        </div>
                        <p className="text-lg text-muted-foreground font-medium flex items-center gap-2">
                            <Mail className="h-4 w-4" /> {user?.email}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="h-11 px-6 font-bold shadow-sm hover:bg-muted/50 transition-colors">
                        Suspend Account
                    </Button>
                    <Button className="h-11 px-6 font-bold shadow-md shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
                        Send Message
                    </Button>
                </div>
            </div>

            <div className="border-b border-border/60 sticky top-0 bg-background/80 backdrop-blur-md z-10 py-1 transition-all duration-300">
                <div className="flex flex-col md:flex-row gap-8 overflow-x-auto no-scrollbar pb-2">
                    {tabCategories.map((category) => {
                        const visibleTabsInCategory = getVisibleTabs(category);
                        if (visibleTabsInCategory.length === 0) return null;

                        return (
                            <div key={category.title} className="flex flex-col gap-2 min-w-max">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/40 pl-1">{category.title}</span>
                                <div className="flex gap-2">
                                    {visibleTabsInCategory.map((tab: any) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={clsx(
                                                "flex items-center gap-2.5 py-2 px-4 rounded-xl font-bold transition-all duration-300 relative whitespace-nowrap border",
                                                activeTab === tab.id
                                                    ? "bg-primary/5 border-primary/20 text-primary shadow-sm"
                                                    : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            <tab.icon className={clsx("h-4 w-4", activeTab === tab.id ? "scale-110" : "scale-100 transition-transform")} />
                                            <span className="text-xs uppercase tracking-widest">{tab.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-8">
                {activeTab === 'profile' && <ProfileTab profile={buyerData?.profile} />}
                {activeTab === 'cart' && <CartTab items={buyerData?.cartItems} onProductClick={(id) => router.push(`/products/${id}`)} />}
                {activeTab === 'wishlist' && <WishlistTab items={buyerData?.wishlistItems} onProductClick={(id) => router.push(`/products/${id}`)} />}
                {activeTab === 'orders' && <OrdersTab items={buyerData?.orders} />}
                {activeTab === 'cancellations' && <CancellationsTab items={buyerData?.cancelledOrders} />}

                {activeTab === 'shop' && <ShopProfileTab profile={sellerFullDetails?.profile} stats={sellerStats} />}
                {activeTab === 'products' && (
                    <SellerTab
                        stats={sellerStats}
                        products={sellerProducts}
                        onProductClick={(productId) => router.push(`/products/${productId}`)}
                    />
                )}
                {activeTab === 'seller_orders' && <SellerOrdersTab orders={sellerFullDetails?.orders} />}
                {activeTab === 'payouts' && <PayoutsTab payouts={sellerFullDetails?.payouts} />}
            </div>
        </div>
    );
}

function ProfileTab({ profile }: { profile: any }) {
    if (!profile) return <p className="text-muted-foreground">No profile record found.</p>;

    return (
        <div className="grid gap-8 md:grid-cols-2 animate-in fade-in duration-500">
            <div className="space-y-6 bg-card border rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-black flex items-center gap-2">
                    <UserIcon className="h-6 w-6 text-primary" /> Identity Credentials
                </h3>
                <div className="grid gap-6">
                    <DetailItem label="Full Legal Name" value={profile.name} />
                    <DetailItem label="Unique ID" value={`@${profile.username}`} />
                    <DetailItem label="Verified Email" value={profile.email} />
                    <DetailItem label="Contact Link" value={profile.phone || 'N/A'} />
                    <DetailItem label="Registration Date" value={new Date(profile.createdAt).toLocaleDateString(undefined, { dateStyle: 'full' })} />
                </div>
            </div>

            <div className="space-y-6 bg-card border rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-black flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-primary" /> Logistics Hubs
                </h3>
                <div className="grid gap-6 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                    {profile.addresses?.map((addr: any) => (
                        <div key={addr.id} className="p-5 rounded-xl border bg-muted/40 relative group hover:border-primary/50 transition-all hover:translate-x-1">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black uppercase tracking-tighter bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/10">
                                    {addr.type} Point
                                </span>
                                {addr.isDefault && (
                                    <span className="text-[10px] font-black uppercase tracking-tighter bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                        <CheckCircle2 className="h-2 w-2" /> Primary Logistics
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-bold leading-relaxed">{addr.line1}</p>
                            {addr.line2 && <p className="text-sm font-medium text-muted-foreground mt-0.5">{addr.line2}</p>}
                            <p className="text-sm font-medium text-muted-foreground mt-2">
                                {addr.city}, {addr.state} {addr.postalCode}
                            </p>
                            <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest opacity-60">
                                {addr.country}
                            </p>
                        </div>
                    ))}
                    {(!profile.addresses || profile.addresses.length === 0) && (
                        <div className="p-10 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground/30">
                            <MapPin className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm font-medium italic">No address points mapped.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ShopProfileTab({ profile, stats }: { profile: any, stats: any }) {
    if (!profile) return (
        <div className="p-20 text-center rounded-[2.5rem] border-2 border-dashed bg-muted/5 opacity-60">
            <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-lg font-bold">No Shop Profile Initialized</p>
            <p className="text-sm text-muted-foreground mt-1">This seller has not completed store setup.</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="relative group">
                <div className="h-[240px] w-full rounded-[2.5rem] bg-muted border overflow-hidden relative shadow-lg">
                    {profile.banner ? (
                        <img src={profile.banner} alt="Banner" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center">
                            <Globe className="h-16 w-16 text-primary/5" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                    <div className="absolute top-6 right-6 flex gap-2">
                        <span className={clsx(
                            "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md shadow-lg",
                            profile.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        )}>
                            {profile.isActive ? 'Active' : 'Suspended'}
                        </span>
                    </div>

                    <div className="absolute bottom-8 left-40 right-10 flex items-end justify-between">
                        <div className="space-y-1">
                            <h2 className="text-4xl font-black text-white tracking-tight">{profile.shopName}</h2>
                            <p className="text-lg font-medium text-white/80 opacity-90 italic">"{profile.tagline || 'Essential Marketplace Entity'}"</p>
                        </div>
                    </div>
                </div>

                <div className="absolute -bottom-8 left-8 h-28 w-28 rounded-3xl bg-card border-[4px] border-background shadow-xl flex items-center justify-center overflow-hidden z-20">
                    {profile.logo ? (
                        <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <Store className="h-12 w-12 text-primary/40" />
                    )}
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-4">
                <div className="bg-card border rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Revenue</span>
                    <span className="text-xl font-black text-primary">Rs. {stats?.revenue?.toLocaleString()}</span>
                </div>
                <div className="bg-card border rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Total Sales</span>
                    <span className="text-xl font-black">{profile.totalSales || 0}</span>
                </div>
                <div className="bg-card border rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Avg Rating</span>
                    <span className="text-xl font-black">{profile.averageRating || 'N/A'}</span>
                </div>
                <div className="bg-card border rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Reviews</span>
                    <span className="text-xl font-black">{profile.totalReviews || 0}</span>
                </div>
                <div className="bg-card border rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Status</span>
                    <span className="text-xl font-black capitalize">{profile.verificationStatus?.toLowerCase()}</span>
                </div>
                <div className="bg-card border rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Member Since</span>
                    <span className="text-xl font-black">{new Date(profile.createdAt).getFullYear()}</span>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-card border rounded-[2rem] p-8 shadow-sm space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-black uppercase tracking-wider text-primary">Store Description</h3>
                            <p className="text-base text-muted-foreground leading-relaxed font-medium">
                                {profile.description || "No public description available."}
                            </p>
                        </div>
                        <Separator className="opacity-10" />
                        <div className="space-y-2">
                            <h3 className="text-lg font-black uppercase tracking-wider text-primary">Mission & Values</h3>
                            <p className="text-base text-muted-foreground/80 leading-relaxed italic">
                                {profile.about || "Mission statement remains unconfigured."}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="bg-card border rounded-[2rem] p-6 space-y-3">
                            <div className="flex items-center gap-2 text-primary">
                                <Package className="h-5 w-5" />
                                <h4 className="font-black uppercase tracking-wider text-sm">Shipping Policy</h4>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                {profile.shippingPolicy || "Standard carrier protocols apply."}
                            </p>
                        </div>
                        <div className="bg-card border rounded-[2rem] p-6 space-y-3">
                            <div className="flex items-center gap-2 text-primary">
                                <RotateCcw className="h-5 w-5" />
                                <h4 className="font-black uppercase tracking-wider text-sm">Return Policy</h4>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                {profile.returnPolicy || "Governed by platform-wide return standards."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-card border rounded-[2rem] p-8 shadow-sm space-y-6">
                        <h3 className="text-lg font-black flex items-center gap-2 text-primary">
                            <Briefcase className="h-5 w-5" /> Business Profile
                        </h3>
                        <div className="space-y-4">
                            <DetailItem label="Entity Name" value={profile.businessName} />
                            <DetailItem label="Reg Number" value={profile.businessRegNo} />
                            <DetailItem label="Legal Type" value={profile.businessType} />
                            <Separator className="opacity-50" />
                            <DetailItem label="Primary Phone" value={profile.phone} />
                            <DetailItem label="Official Email" value={profile.email} />
                        </div>
                    </div>

                    <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-sm">
                        Request Seller Audit
                    </Button>
                </div>
            </div>
        </div>
    );
}


function SellerOrdersTab({ orders }: { orders: any[] }) {
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    if (!orders || orders.length === 0) return (
        <div className="p-20 text-center rounded-2xl border-2 border-dashed bg-muted/10 opacity-60">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-lg font-bold">No Transaction History</p>
            <p className="text-sm text-muted-foreground mt-1">This node has not processed any external orders yet.</p>
        </div>
    );

    return (
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-b">
                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground w-12"></th>
                            <th className="p-6 pl-0 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Log ID</th>
                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Contractor</th>
                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Lifecycle</th>
                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Financial Breakdown</th>
                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground text-right font-black">Settlement</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                        {orders.map((order) => (
                            <>
                                <tr key={order.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                                    <td className="p-6 text-center">
                                        {expandedOrder === order.id ? <ChevronDown className="h-4 w-4 text-primary" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                    </td>
                                    <td className="p-6 pl-0">
                                        <p className="font-black text-foreground/90 group-hover:text-primary transition-colors">#{order.orderNumber}</p>
                                        <p className="text-[10px] text-muted-foreground tracking-tighter mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-[10px] font-black border border-primary/10">
                                                {order.buyerName?.[0]}
                                            </div>
                                            <span className="font-bold">{order.buyerName}</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-muted-foreground font-medium">
                                        <span className={clsx(
                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                                            order.status === 'DELIVERED' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                order.status === 'CANCELLED' ? "bg-rose-50 text-rose-700 border-rose-100" :
                                                    "bg-amber-50 text-amber-700 border-amber-100"
                                        )}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex justify-between text-[10px] font-bold">
                                                <span className="text-muted-foreground opacity-60">Subtotal</span>
                                                <span>Rs. {order.subtotal.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-[10px] font-bold">
                                                <span className="text-muted-foreground opacity-60">Platform Fee</span>
                                                <span className="text-rose-500">-Rs. {order.commission.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 font-black text-right text-base text-primary">Rs. {order.total.toLocaleString()}</td>
                                </tr>
                                {expandedOrder === order.id && (
                                    <tr className="bg-muted/10 border-b">
                                        <td colSpan={6} className="p-8 pb-10">
                                            <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Info className="h-4 w-4 text-primary" />
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Line Item Resources</h4>
                                                </div>
                                                <div className="grid gap-4">
                                                    {order.items.map((item: any) => (
                                                        <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border bg-card shadow-sm">
                                                            <div className="flex-1">
                                                                <p className="font-bold text-sm tracking-tight">{item.productName}</p>
                                                                <p className="text-[10px] font-mono text-muted-foreground uppercase opacity-60 mt-0.5">{item.variantName}</p>
                                                            </div>
                                                            <div className="flex items-center gap-8 text-right">
                                                                <div>
                                                                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Quantity</p>
                                                                    <p className="font-black">x{item.quantity}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Unit Val</p>
                                                                    <p className="font-bold">Rs. {item.unitPrice.toLocaleString()}</p>
                                                                </div>
                                                                <div className="w-24">
                                                                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Subtotal</p>
                                                                    <p className="font-black text-primary">Rs. {item.totalPrice.toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function PayoutsTab({ payouts }: { payouts: any[] }) {
    if (!payouts || payouts.length === 0) return (
        <div className="p-20 text-center rounded-2xl border-2 border-dashed bg-muted/10 opacity-60">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-lg font-bold">No Disbursement History</p>
            <p className="text-sm text-muted-foreground mt-1">No automated or manual payouts have been logged for this entry.</p>
        </div>
    );

    return (
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-b">
                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Payout Reference</th>
                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground text-center">Protocol Status</th>
                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground text-center">Scheduled Period</th>
                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground text-right font-black">Amount Disbursed</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                        {payouts.map((payout) => (
                            <tr key={payout.id} className="hover:bg-muted/30 transition-colors">
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-muted border flex items-center justify-center">
                                            <CreditCard className="h-5 w-5 text-muted-foreground/60" />
                                        </div>
                                        <div>
                                            <p className="font-black text-foreground/90 uppercase tracking-tighter">REF-{payout.id.slice(-8)}</p>
                                            <p className="text-[10px] text-muted-foreground tracking-tighter mt-0.5">Created: {new Date(payout.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6 text-center">
                                    <span className={clsx(
                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                        payout.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                            payout.status === 'FAILED' ? "bg-rose-50 text-rose-700 border-rose-100" :
                                                "bg-amber-50 text-amber-700 border-amber-100"
                                    )}>
                                        {payout.status}
                                    </span>
                                </td>
                                <td className="p-6 text-center text-muted-foreground font-black text-[10px] uppercase tracking-tighter">
                                    {new Date(payout.scheduledFor).toLocaleDateString()}
                                </td>
                                <td className="p-6 font-black text-right text-lg text-foreground">Rs. {payout.amount.toLocaleString()} <span className="text-[10px] opacity-40">{payout.currency}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function CartTab({ items, onProductClick }: { items: any[], onProductClick: (id: string) => void }) {
    if (!items || items.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed rounded-2xl bg-card">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-extrabold text-muted-foreground/60">Registry Empty</h3>
            <p className="text-sm text-muted-foreground/50 mt-1 italic">No active cart session detected for this user ID.</p>
        </div>
    );

    return (
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-b">
                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Resource</th>
                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Specification</th>
                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Unit Price</th>
                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Quantity</th>
                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground text-right">Extended Price</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                        {items.map((item) => (
                            <tr
                                key={item.id}
                                className="hover:bg-muted/30 transition-colors cursor-pointer"
                                onClick={() => onProductClick(item.productId)}
                            >
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-lg bg-muted border overflow-hidden shadow-sm flex-shrink-0">
                                            {item.productImage && <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />}
                                        </div>
                                        <span className="font-bold text-base tracking-tight">{item.productName}</span>
                                    </div>
                                </td>
                                <td className="p-6 font-mono text-xs text-muted-foreground uppercase tracking-widest">{item.variantName}</td>
                                <td className="p-6 font-bold text-foreground/80">Rs. {item.price.toLocaleString()}</td>
                                <td className="p-6 font-bold text-foreground/80">{item.quantity}</td>
                                <td className="p-6 font-black text-right text-primary">Rs. {(item.price * item.quantity).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function WishlistTab({ items, onProductClick }: { items: any[], onProductClick: (id: string) => void }) {
    if (!items || items.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed rounded-2xl bg-card">
            <Heart className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-extrabold text-muted-foreground/60">Collection Empty</h3>
            <p className="text-sm text-muted-foreground/50 mt-1 italic">No curated items found in user collection.</p>
        </div>
    );

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 animate-in fade-in duration-500">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="group bg-card border rounded-2xl p-4 shadow-sm hover:shadow-2xl hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                    onClick={() => onProductClick(item.productId)}
                >
                    <div className="aspect-square rounded-xl bg-muted border overflow-hidden mb-4 shadow-inner relative">
                        {item.productImage && (
                            <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        )}
                        <div className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                        </div>
                    </div>
                    <h4 className="font-bold text-sm tracking-tight line-clamp-1">{item.productName}</h4>
                    <p className="text-lg font-black text-primary mt-1">Rs. {item.price.toLocaleString()}</p>
                    <Button variant="secondary" size="sm" className="w-full mt-4 font-black text-[10px] uppercase tracking-wider rounded-lg shadow-sm">
                        View Item
                    </Button>
                </div>
            ))}
        </div>
    );
}

function OrdersTab({ items }: { items: any[] }) {
    if (!items || items.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed rounded-2xl bg-card">
            <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-extrabold text-muted-foreground/60">No Order History</h3>
            <p className="text-sm text-muted-foreground/50 mt-1 italic">User has not generated any successful purchase orders.</p>
        </div>
    );

    return (
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-b">
                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Order Hash</th>
                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Timestamp</th>
                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Lifecycle</th>
                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Item Volume</th>
                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground text-right">Value</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                        {items.map((order) => (
                            <tr key={order.id} className="hover:bg-muted/30 transition-colors cursor-pointer group">
                                <td className="p-6 font-black text-foreground/90 group-hover:text-primary transition-colors">#{order.orderNumber}</td>
                                <td className="p-6 text-muted-foreground font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="p-6">
                                    <span className={clsx(
                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                                        order.status === 'DELIVERED' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                            order.status === 'SHIPPED' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                order.status === 'CANCELLED' ? "bg-rose-50 text-rose-700 border-rose-100" :
                                                    "bg-amber-50 text-amber-700 border-amber-100"
                                    )}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground opacity-60 tracking-widest leading-none">Payload Volume</span>
                                        <p className="font-black italic text-lg tracking-tighter mt-1">{order.itemCount} Units</p>
                                    </div>
                                </td>
                                <td className="p-6 font-black text-right text-2xl tracking-tighter italic text-primary">Rs. {order.total.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


function CancellationsTab({ items }: { items: any[] }) {
    if (!items || items.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed rounded-2xl bg-card">
            <XCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-extrabold text-muted-foreground/60">Clean Record</h3>
            <p className="text-sm text-muted-foreground/50 mt-1 italic">No cancelled transactions or active disputes detected.</p>
        </div>
    );

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-500">
            {items.map((item) => (
                <div key={item.id} className="bg-card border rounded-2xl p-6 shadow-sm border-l-4 border-l-rose-500 hover:shadow-2xl hover:border-rose-200 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                            <XCircle className="h-5 w-5 text-rose-500" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-extrabold text-lg mb-1 group-hover:text-rose-600 transition-colors">Log #{item.orderNumber}</h4>
                    <p className="text-sm font-black text-rose-600 uppercase tracking-tighter mb-4">{item.reason}</p>
                    <Separator className="mb-4 opacity-50" />
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Audit Narrative</p>
                        <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-rose-100 pl-4 py-1">"{item.description || 'No reason provided.'}"</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function SellerTab({ stats, products, onProductClick }: { stats: any, products: any[], onProductClick: (id: string) => void }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Compact Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-card border rounded-2xl p-5 flex flex-col gap-1 shadow-sm hover:border-primary/20 transition-colors">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Revenue</span>
                    <span className="text-2xl font-black text-primary">Rs. {stats?.revenue?.toLocaleString()}</span>
                </div>
                <div className="bg-card border rounded-2xl p-5 flex flex-col gap-1 shadow-sm hover:border-primary/20 transition-colors">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Gross Sales</span>
                    <span className="text-2xl font-black">{stats?.sales || 0}</span>
                </div>
                <div className="bg-card border rounded-2xl p-5 flex flex-col gap-1 shadow-sm hover:border-primary/20 transition-colors">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Cart Presence</span>
                    <span className="text-2xl font-black">{stats?.inCartCount || 0}</span>
                </div>
                <div className="bg-card border rounded-2xl p-5 flex flex-col gap-1 shadow-sm hover:border-primary/20 transition-colors">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Wishlist Hits</span>
                    <span className="text-2xl font-black">{stats?.inWishlistCount || 0}</span>
                </div>
                <div className="bg-card border rounded-2xl p-5 flex flex-col gap-1 shadow-sm hover:border-primary/20 transition-colors">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Returns</span>
                    <span className="text-2xl font-black text-rose-500">{stats?.returnedCount || 0}</span>
                </div>
            </div>

            {/* Inventory Table Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="space-y-1">
                        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                            <Store className="h-5 w-5 text-primary" /> Active Inventory Registry
                        </h2>
                        <p className="text-xs text-muted-foreground font-medium italic">Managed assets and distributed resource logs.</p>
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase bg-muted/60 px-4 py-2 rounded-xl border border-border/60">
                        {products.length} Items Indexed
                    </span>
                </div>

                <div className="rounded-[2rem] border bg-card shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/50 border-b">
                                    <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Asset Identity</th>
                                    <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Class</th>
                                    <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Valuation</th>
                                    <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground text-center">Volume</th>
                                    <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground text-center">Protocol Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {products.map((product: any) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-muted/30 cursor-pointer transition-all group"
                                        onClick={() => onProductClick(product.id)}
                                    >
                                        <td className="p-6">
                                            <p className="font-bold text-base tracking-tight group-hover:text-primary transition-colors">{product.name}</p>
                                            <p className="text-[9px] font-mono text-muted-foreground mt-0.5 opacity-40 uppercase tracking-tighter">OBJ_{product.id.slice(0, 16)}...</p>
                                        </td>
                                        <td className="p-6">
                                            <span className="text-[10px] font-black bg-muted/80 px-3 py-1.5 rounded-lg border border-border/40 uppercase tracking-widest">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <p className="font-black text-base text-foreground/80 italic">Rs. {product.price.toLocaleString()}</p>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className={clsx(
                                                    "font-black text-lg tracking-tighter leading-none",
                                                    product.stock < 10 ? "text-rose-500" : "text-foreground"
                                                )}>
                                                    {product.stock}
                                                </span>
                                                <span className="text-[8px] font-black uppercase opacity-40 tracking-widest mt-0.5">Units</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className={clsx(
                                                "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                                                product.status === 'ACTIVE'
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                            )}>
                                                {product.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-24 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-40 grayscale">
                                                <Store className="h-12 w-12 text-muted-foreground mb-4" />
                                                <p className="text-xl font-black italic tracking-tight">Registry Entry Vacant</p>
                                                <p className="text-sm font-medium mt-1">No active assets detected in this node's collection.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}


function Badge({ label, value, icon: Icon }: { label: string, value: any, icon: any }) {
    return (
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 text-white shadow-xl">
            <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-none">
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">{label}</span>
                <span className="text-sm font-black italic leading-tight">{value}</span>
            </div>
        </div>
    );
}

function CardSection({ title, content, icon: Icon }: { title: string, content: string, icon: any }) {
    return (
        <div className="bg-card border rounded-[2rem] p-8 shadow-sm hover:border-primary/30 transition-colors group">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-black italic">{title}</h3>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed font-medium italic opacity-80">
                {content || "No protocol details specified for this module."}
            </p>
        </div>
    );
}

function MetricCard({ title, value, icon: Icon, color }: { title: string, value: any, icon: any, color: string }) {
    const colorClasses: Record<string, string> = {
        indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700 shadow-indigo-500/5',
        emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-emerald-500/5',
        amber: 'bg-amber-50 border-amber-100 text-amber-700 shadow-amber-500/5',
        rose: 'bg-rose-50 border-rose-100 text-rose-700 shadow-rose-500/5',
        slate: 'bg-slate-50 border-slate-100 text-slate-700 shadow-slate-500/5'
    };

    return (
        <div className={clsx(
            "rounded-[2.5rem] border p-8 shadow-xl flex flex-col justify-between h-52 transition-all hover:scale-[1.02] hover:shadow-2xl duration-500 group relative overflow-hidden",
            colorClasses[color] || colorClasses.slate
        )}>
            <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:opacity-10 transition-all rotate-12 group-hover:rotate-0 transform duration-500">
                <Icon className="h-24 w-24" />
            </div>
            <div className="flex items-center justify-between z-10">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70 italic leading-none">{title}</p>
                <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover:shadow-primary/20 transition-all">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <div className="z-10 mt-auto">
                <p className="text-4xl font-black italic tracking-tighter tabular-nums">{value ?? 0}</p>
                <div className="flex items-center gap-1.5 opacity-60 mt-1">
                    <Activity className="h-3 w-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Registry Metric Active</span>
                </div>
            </div>
        </div>
    );
}


function DetailItem({ label, value }: { label: string, value: any }) {
    return (
        <div className="space-y-1.5 group">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] group-hover:text-primary transition-colors opacity-60">{label}</p>
            <p className="text-lg font-bold text-foreground border-b border-transparent group-hover:border-primary/20 pb-1 transition-all">
                {value || <span className="text-muted-foreground/30 italic font-medium">Undefined Mapping</span>}
            </p>
        </div>
    );
}
