import { useEffect, useState, useMemo } from 'react';
import { Clock, UserCheck, XCircle, Search } from 'lucide-react';
import { authService } from '../../../services/authService';
import { PendingUser } from '../../../types/auth';

export function PendingUsers() {
    const [users, setUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [approvedToday, setApprovedToday] = useState(0);
    const [rejectedCount, setRejectedCount] = useState(0);

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            setLoading(true);
            const data = await authService.getPendingUsers();
            setUsers(data);
        } catch (err) {
            setError('Failed to load pending users.');
        } finally {
            setLoading(false);
        }
    }

    async function handleApprove(id: number) {
        await authService.approveUser(id);
        setUsers(prev => prev.filter(u => u.id !== id));
        setApprovedToday(prev => prev + 1);
    }

    async function handleReject(id: number) {
        await authService.rejectUser(id);
        setUsers(prev => prev.filter(u => u.id !== id));
        setRejectedCount(prev => prev + 1);
    }

    const filteredUsers = useMemo(() => {
        if (!search.trim()) return users;
        const q = search.toLowerCase();
        return users.filter(
            u =>
                `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q)
        );
    }, [users, search]);

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    function getInitials(firstName: string, lastName: string) {
        return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
    }

    if (loading) {
        return <div className="p-6 text-slate-500">Loading...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-600">{error}</div>;
    }

    return (
        <div>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-slate-500">Pending Requests</span>
                        <Clock className="size-5 text-amber-500" />
                    </div>
                    <div className="text-3xl font-semibold text-slate-900">{users.length}</div>
                    <div className="text-xs text-slate-400 mt-1">Awaiting review</div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-slate-500">Approved Today</span>
                        <UserCheck className="size-5 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-semibold text-slate-900">{approvedToday}</div>
                    <div className="text-xs text-slate-400 mt-1">Granted access</div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-slate-500">Rejected</span>
                        <XCircle className="size-5 text-red-500" />
                    </div>
                    <div className="text-3xl font-semibold text-slate-900">{rejectedCount}</div>
                    <div className="text-xs text-slate-400 mt-1">Access denied</div>
                </div>
            </div>

            {/* Main list */}
            <div className="bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div>
                        <h2 className="font-medium text-slate-900">Registration Requests</h2>
                        <p className="text-sm text-slate-500">
                            {users.length} request{users.length !== 1 ? 's' : ''} awaiting approval
                        </p>
                    </div>
                    <div className="relative">
                        <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        />
                    </div>
                </div>

                {filteredUsers.length === 0 ? (
                    <div className="text-center text-slate-400 py-16">
                        {users.length === 0
                            ? "No pending requests — you're all caught up!"
                            : 'No results match your search.'}
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredUsers.map(u => (
                            <div key={u.id} className="flex items-center justify-between px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-medium">
                                        {getInitials(u.firstName, u.lastName)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            {u.firstName} {u.lastName}
                                        </p>
                                        <p className="text-sm text-slate-500">{u.email}</p>
                                        <p className="text-xs text-slate-400">Requested on {formatDate(u.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => handleApprove(u.id)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                                    >
                                        <UserCheck className="size-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(u.id)}
                                        className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                                    >
                                        <XCircle className="size-4" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}