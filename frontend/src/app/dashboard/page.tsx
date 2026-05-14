'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import Cookies from 'js-cookie';
import { User, Calendar, CreditCard, Heart, Settings, LogOut } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function DashboardPage() {
    const { user, token, logout, updateUser, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading dashboard...</div>;

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <ProfileSection user={user} token={token!} updateUser={updateUser} />;
            case 'bookings': return <BookingsSection token={token!} />;
            case 'leasing': return <LeasingSection token={token!} />;
            case 'favorites': return <FavoritesSection token={token!} />;
            case 'settings': return <SettingsSection />;
            default: return null;
        }
    };

    return (
        <div className="container" style={{ padding: '3rem 0', display: 'flex', gap: '2rem', minHeight: '80vh' }}>
            {/* Sidebar */}
            <div style={{ width: '250px', flexShrink: 0, borderRight: '1px solid hsl(var(--border))', paddingRight: '1rem' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid hsl(var(--border))', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{user.full_name || 'My Account'}</div>
                    <div style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>{user.email}</div>
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <TabButton icon={<User size={18} />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                    <TabButton icon={<Calendar size={18} />} label="My Bookings" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
                    <TabButton icon={<CreditCard size={18} />} label="My Leasing" active={activeTab === 'leasing'} onClick={() => setActiveTab('leasing')} />
                    <TabButton icon={<Heart size={18} />} label="Favorites" active={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')} />
                    <TabButton icon={<Settings size={18} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                    <div style={{ marginTop: '2rem' }}>
                        <button onClick={() => { logout(); router.push('/'); }} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', width: '100%', borderRadius: '8px', border: 'none', background: 'transparent', color: 'hsl(var(--destructive))', cursor: 'pointer', textAlign: 'left' }}>
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </nav>
            </div>
            {/* Main Content */}
            <div style={{ flex: 1, padding: '1rem' }}>
                {renderContent()}
            </div>
        </div>
    );
}

function TabButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', width: '100%',
                borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left',
                background: active ? 'hsl(var(--muted))' : 'transparent',
                color: active ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                fontWeight: active ? 600 : 400
            }}
        >
            {icon} {label}
        </button>
    );
}

function ProfileSection({ user, token, updateUser }: { user: any, token: string, updateUser: any }) {
    const [fullName, setFullName] = useState(user.full_name || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');

    const handleSave = async (e: any) => {
        e.preventDefault();
        try {
            const data: any = { full_name: fullName, phone };
            if (password) data.password = password;
            const res = await api.put('/auth/me', data);
            updateUser(res.data);
            setMsg('Profile updated successfully!');
            setPassword('');
        } catch (err: any) {
            setMsg('Failed to update profile.');
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Profile Summary</h2>
            {msg && <div style={{ marginBottom: '1rem', color: msg.includes('success') ? 'green' : 'red' }}>{msg}</div>}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} />
                
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email Address (Read Only)</label>
                <input type="email" value={user.email} disabled style={{ ...inputStyle, opacity: 0.7 }} />
                
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Phone Number</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
                
                <h3 style={{ fontSize: '1.25rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Change Password</h3>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>New Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current" style={inputStyle} />
                
                <Button type="submit" style={{ marginTop: '1rem' }}>Save Changes</Button>
            </form>
        </div>
    );
}

function BookingsSection({ token }: { token: string }) {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/bookings/my')
            .then(res => setBookings(res.data))
            .finally(() => setLoading(false));
    }, [token]);

    const handleCancel = async (id: number) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await api.delete(`/bookings/${id}`);
            setBookings(bookings.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
        } catch (err) {
            alert('Failed to cancel booking.');
        }
    };

    if (loading) return <div>Loading bookings...</div>;
    if (bookings.length === 0) return <div>No bookings found.</div>;

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>My Bookings</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bookings.map(b => (
                    <div key={b.id} style={{ border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>Car ID: {b.car_id}</div>
                            <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>
                                {new Date(b.start_date).toLocaleDateString()} - {new Date(b.end_date).toLocaleDateString()}
                            </div>
                            <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>Total: ${b.total_price}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ marginBottom: '0.5rem', color: b.status === 'Active' ? 'green' : (b.status === 'Cancelled' ? 'red' : 'inherit') }}>
                                {b.status}
                            </div>
                            {b.status === 'Active' && (
                                <Button variant="outline" size="sm" onClick={() => handleCancel(b.id)}>Cancel</Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LeasingSection({ token }: { token: string }) {
    const [apps, setApps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/leasing/my')
            .then(res => setApps(res.data))
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) return <div>Loading applications...</div>;
    if (apps.length === 0) return <div>No leasing applications found.</div>;

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Leasing Applications</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {apps.map(a => (
                    <div key={a.id} style={{ border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>Car ID: {a.car_id}</div>
                            <div style={{ fontSize: '0.875rem' }}>Monthly: ${a.monthly_payment} for {a.term_months} mos</div>
                            <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>Down Payment: ${a.down_payment}</div>
                        </div>
                        <div style={{ fontWeight: 600, color: a.status === 'Pending' ? 'orange' : 'inherit' }}>{a.status}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FavoritesSection({ token }: { token: string }) {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        api.get('/favorites')
            .then(res => setFavorites(res.data))
            .finally(() => setLoading(false));
    }, [token]);

    const handleRemove = async (carId: number) => {
        try {
            await api.delete(`/favorites/${carId}`);
            setFavorites(favorites.filter(f => f.car_id !== carId));
        } catch(err) {
            alert('Failed to remove favorite');
        }
    };

    if (loading) return <div>Loading favorites...</div>;
    if (favorites.length === 0) return <div>No favorites yet. Go browse cars!</div>;

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>My Favorites</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {favorites.map(f => (
                    <div key={f.id} style={{ border: '1px solid hsl(var(--border))', borderRadius: '12px', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>Car ID: {f.car_id}</div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <Button size="sm" style={{ flex: 1 }} onClick={() => router.push(`/cars/${f.car_id}`)}>View & Book</Button>
                                <Button variant="outline" size="sm" onClick={() => handleRemove(f.car_id)}>Remove</Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SettingsSection() {
    return (
        <div style={{ maxWidth: '400px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Settings</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Language Preference</label>
                    <select style={inputStyle}>
                        <option>English (EN)</option>
                        <option>Russian (RU)</option>
                        <option>Arabic (AR)</option>
                    </select>
                </div>
                <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Notification Preferences</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <label><input type="checkbox" defaultChecked /> Email</label>
                        <label><input type="checkbox" defaultChecked /> SMS</label>
                    </div>
                </div>
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid hsl(var(--border))' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'hsl(var(--destructive))', marginBottom: '0.5rem' }}>Danger Zone</h3>
                    <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }}>Once you delete your account, there is no going back. Please be certain.</p>
                    <Button variant="outline" style={{ color: 'hsl(var(--destructive))', borderColor: 'hsl(var(--destructive))' }} onClick={() => alert('Feature disabled for demo.')}>Delete Account</Button>
                </div>
            </div>
        </div>
    );
}

const inputStyle = {
    padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', width: '100%'
};
