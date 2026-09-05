import { usePage } from '@inertiajs/react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import Card from '../../components/Card';
import AdminLayout from '../../layouts/AdminLayout';
import type { ActivityLog, DashboardStats, PageProps } from '../../types';

const COLORS = ['#0EA5A8', '#2563EB', '#64748B', '#F59E0B', '#EF4444', '#8B5CF6'];

function formatDate(value: string) {
    const date = new Date(value);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface DashboardPageProps extends PageProps {
    stats: DashboardStats;
    recentActivity: ActivityLog[];
}

export default function Dashboard() {
    const { stats, recentActivity } = usePage<DashboardPageProps>().props;

    return (
        <AdminLayout title="Dashboard">
            <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <SummaryCard title="Page views" value={stats.summary.page_views} />
                    <SummaryCard title="Unique sessions" value={stats.summary.unique_sessions} />
                    <SummaryCard title="SERP fetches" value={stats.summary.serp_fetches} />
                </div>

                <Card>
                    <h2 className="mb-4 text-lg font-semibold text-navy-950">Visits over the last 30 days</h2>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.visits} margin={{ top: 10, right: 20, bottom: 0, left: -20 }}>
                                <defs>
                                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0EA5A8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0EA5A8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    labelFormatter={(label) => formatDate(label as string)}
                                    contentStyle={{ borderRadius: '0.5rem', borderColor: '#E2E8F0' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#0EA5A8"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#viewsGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <h2 className="mb-4 text-lg font-semibold text-navy-950">Device breakdown</h2>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.devices}
                                        dataKey="sessions"
                                        nameKey="device"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        label
                                    >
                                        {stats.devices.map((entry, index) => (
                                            <Cell key={`cell-${entry.device}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '0.5rem', borderColor: '#E2E8F0' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card>
                        <h2 className="mb-4 text-lg font-semibold text-navy-950">Top pages</h2>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.topPages} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="path"
                                        type="category"
                                        width={120}
                                        tick={{ fontSize: 12 }}
                                        interval={0}
                                    />
                                    <Tooltip contentStyle={{ borderRadius: '0.5rem', borderColor: '#E2E8F0' }} />
                                    <Bar dataKey="views" fill="#2563EB" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-1">
                        <h2 className="mb-4 text-lg font-semibold text-navy-950">Recent activity</h2>
                        {recentActivity.length === 0 ? (
                            <p className="text-sm text-slate-500">No recent activity.</p>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {recentActivity.map((log) => (
                                    <li key={log.id} className="py-3">
                                        <p className="text-sm font-medium text-slate-900">{log.description}</p>
                                        <p className="text-xs text-slate-500">
                                            {log.actor_name ?? 'System'} • {formatDate(log.created_at ?? '')}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>

                    <Card className="lg:col-span-2">
                        <h2 className="mb-4 text-lg font-semibold text-navy-950">SERP fetches over the last 30 days</h2>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={stats.serpFetches}
                                    margin={{ top: 10, right: 20, bottom: 0, left: -20 }}
                                >
                                    <defs>
                                        <linearGradient id="serpGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                    <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        labelFormatter={(label) => formatDate(label as string)}
                                        contentStyle={{ borderRadius: '0.5rem', borderColor: '#E2E8F0' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="fetches"
                                        stroke="#2563EB"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#serpGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}

function SummaryCard({ title, value }: { title: string; value: number }) {
    return (
        <Card className="flex flex-col">
            <span className="text-sm font-medium text-slate-500">{title}</span>
            <span className="mt-2 text-3xl font-bold text-navy-950">{value.toLocaleString()}</span>
        </Card>
    );
}
