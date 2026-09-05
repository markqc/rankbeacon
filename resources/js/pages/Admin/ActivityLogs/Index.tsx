import { router, useForm, usePage } from '@inertiajs/react';
import { Eye, Search, X } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../components/Button';
import FormField from '../../../components/FormField';
import TextInput from '../../../components/TextInput';
import AdminLayout from '../../../layouts/AdminLayout';
import type { ActivityLog, PageProps, PaginatedData } from '../../../types';

interface ActivityLogPageProps extends PageProps {
    logs: PaginatedData<ActivityLog>;
    filters: {
        search?: string;
        module?: string;
        event?: string;
        method?: string;
        actor_id?: string;
        from?: string;
        to?: string;
    };
    modules: string[];
    events: string[];
    methods: string[];
}

function FilterSelect({
    label,
    value,
    options,
    onChange,
    id,
}: {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
    id: string;
}) {
    return (
        <FormField label={label} htmlFor={id}>
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
                <option value="">All</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </FormField>
    );
}

function Pagination({ meta }: { meta: PaginatedData<ActivityLog>['meta'] }) {
    const pages = Array.from({ length: meta.last_page }, (_, i) => i + 1);

    return (
        <nav aria-label="Activity log pagination" className="mt-6 flex flex-wrap items-center gap-2">
            {pages.map((page) => {
                const active = page === meta.current_page;

                return (
                    <button
                        key={page}
                        type="button"
                        onClick={() => router.get(meta.path, { page }, { preserveState: true, preserveScroll: true })}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                            active
                                ? 'bg-blue-600 text-white'
                                : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                        aria-current={active ? 'page' : undefined}
                    >
                        {page}
                    </button>
                );
            })}
            <span className="ml-auto text-sm text-slate-500">
                {meta.from ?? 0}-{meta.to ?? 0} of {meta.total}
            </span>
        </nav>
    );
}

function DetailDrawer({ log, onClose }: { log: ActivityLog; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-40 flex justify-end">
            <div className="absolute inset-0 bg-slate-900/25" onClick={onClose} aria-hidden="true" />
            <div className="relative w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl sm:w-96">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-navy-950">Event details</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        aria-label="Close details"
                    >
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>

                <dl className="space-y-4 text-sm">
                    <DetailRow label="ID" value={log.id} />
                    <DetailRow label="Date" value={log.created_at ? new Date(log.created_at).toLocaleString() : '-'} />
                    <DetailRow label="Event" value={log.event} />
                    <DetailRow label="Module" value={log.module} />
                    <DetailRow label="Description" value={log.description ?? '-'} />
                    <DetailRow label="Actor" value={log.actor_name ?? log.actor_email ?? 'System'} />
                    <DetailRow label="Actor email" value={log.actor_email ?? '-'} />
                    <DetailRow label="Method" value={log.method ?? '-'} />
                    <DetailRow label="URL" value={log.url ?? '-'} />
                    <DetailRow label="IP address" value={log.ip_address ?? '-'} />
                    <DetailRow label="User agent" value={log.user_agent ?? '-'} />
                    <DetailRow label="Request ID" value={log.request_id ?? '-'} />
                </dl>

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-6">
                        <h4 className="mb-2 font-medium text-slate-900">Metadata</h4>
                        <pre className="max-h-64 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                            {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <dt className="text-slate-500">{label}</dt>
            <dd className="mt-0.5 break-words font-medium text-slate-900">{value}</dd>
        </div>
    );
}

export default function Index() {
    const { props } = usePage<ActivityLogPageProps>();
    const { logs, filters, modules, events, methods } = props;
    const [selected, setSelected] = useState<ActivityLog | null>(null);

    const { data, setData, get, processing } = useForm({
        search: filters.search ?? '',
        module: filters.module ?? '',
        event: filters.event ?? '',
        method: filters.method ?? '',
        actor_id: filters.actor_id ?? '',
        from: filters.from ?? '',
        to: filters.to ?? '',
    });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        get('/admin/activity-logs', { preserveState: true, preserveScroll: true });
    }

    function resetFilters() {
        router.get('/admin/activity-logs', {}, { preserveState: true, preserveScroll: true });
    }

    return (
        <AdminLayout title="Activity Logs">
            <div className="space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-navy-950">Activity Logs</h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Review recorded admin actions, logins, and page views.
                    </p>

                    <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <FormField label="Search" htmlFor="search">
                            <div className="relative">
                                <TextInput
                                    id="search"
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                    placeholder="Event, description, actor…"
                                />
                                <Search
                                    className="absolute right-3 top-2.5 h-4 w-4 text-slate-400"
                                    aria-hidden="true"
                                />
                            </div>
                        </FormField>

                        <FilterSelect
                            id="module"
                            label="Module"
                            value={data.module}
                            options={modules}
                            onChange={(value) => setData('module', value)}
                        />

                        <FilterSelect
                            id="event"
                            label="Event"
                            value={data.event}
                            options={events}
                            onChange={(value) => setData('event', value)}
                        />

                        <FilterSelect
                            id="method"
                            label="Method"
                            value={data.method}
                            options={methods}
                            onChange={(value) => setData('method', value)}
                        />

                        <FormField label="Actor ID" htmlFor="actor_id">
                            <TextInput
                                id="actor_id"
                                type="number"
                                value={data.actor_id}
                                onChange={(e) => setData('actor_id', e.target.value)}
                                placeholder="e.g. 1"
                            />
                        </FormField>

                        <FormField label="From" htmlFor="from">
                            <TextInput
                                id="from"
                                type="date"
                                value={data.from}
                                onChange={(e) => setData('from', e.target.value)}
                            />
                        </FormField>

                        <FormField label="To" htmlFor="to">
                            <TextInput
                                id="to"
                                type="date"
                                value={data.to}
                                onChange={(e) => setData('to', e.target.value)}
                            />
                        </FormField>

                        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
                            <Button type="submit" disabled={processing}>
                                Filter
                            </Button>
                            <Button type="button" variant="secondary" onClick={resetFilters}>
                                Reset
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-700">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Date</th>
                                    <th className="px-4 py-3 font-semibold">Actor</th>
                                    <th className="px-4 py-3 font-semibold">Module</th>
                                    <th className="px-4 py-3 font-semibold">Event</th>
                                    <th className="px-4 py-3 font-semibold">Method</th>
                                    <th className="px-4 py-3 font-semibold">Description</th>
                                    <th className="px-4 py-3 font-semibold">IP</th>
                                    <th className="px-4 py-3 font-semibold sr-only">View</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-600">
                                            {log.created_at ? new Date(log.created_at).toLocaleString() : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-slate-900">
                                            {log.actor_name ?? log.actor_email ?? 'System'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                                                {log.module}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{log.event}</td>
                                        <td className="px-4 py-3 text-slate-600">{log.method ?? '-'}</td>
                                        <td className="max-w-xs px-4 py-3 truncate text-slate-600">
                                            {log.description ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{log.ip_address ?? '-'}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() => setSelected(log)}
                                                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                aria-label={`View details for event ${log.id}`}
                                            >
                                                <Eye className="h-4 w-4" aria-hidden="true" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {logs.data.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                                            No activity logs found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {logs.meta.last_page > 1 && <Pagination meta={logs.meta} />}
                </div>
            </div>

            {selected && <DetailDrawer log={selected} onClose={() => setSelected(null)} />}
        </AdminLayout>
    );
}
