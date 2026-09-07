import { router, useForm, usePage } from '@inertiajs/react';
import { Search, Shield } from 'lucide-react';
import { type FormEvent } from 'react';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import FormField from '../../../components/FormField';
import LinkButton from '../../../components/LinkButton';
import TextInput from '../../../components/TextInput';
import AdminLayout from '../../../layouts/AdminLayout';
import type { AdminUser, PageProps, PaginatedData } from '../../../types';

interface UsersPageProps extends PageProps {
    users: PaginatedData<AdminUser>;
}

export default function Index() {
    const { users, auth } = usePage<UsersPageProps>().props;
    const currentUserId = auth.user?.id;
    const { data, setData, get } = useForm({ search: '', status: '' });

    function submit(e: FormEvent) {
        e.preventDefault();
        get('/admin/users', { preserveState: true });
    }

    return (
        <AdminLayout title="Users">
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold text-navy-950">Users</h1>
                    <LinkButton href="/admin/users/create">Create user</LinkButton>
                </div>

                <Card>
                    <form onSubmit={submit} className="flex flex-col gap-4 sm:flex-row">
                        <FormField label="Search" className="flex-1" hideLabel>
                            <div className="relative">
                                <TextInput
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                    placeholder="Search by name or email"
                                    aria-label="Search by name or email"
                                />
                                <Search
                                    className="absolute right-3 top-2.5 h-4 w-4 text-slate-400"
                                    aria-hidden="true"
                                />
                            </div>
                        </FormField>

                        <FormField label="Status" className="sm:w-48" hideLabel>
                            <select
                                value={data.status}
                                onChange={(e) => {
                                    setData('status', e.target.value);
                                    get('/admin/users', { preserveState: true });
                                }}
                                className="w-full rounded-md border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                                aria-label="Filter by status"
                            >
                                <option value="">All statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </FormField>

                        <Button type="submit" variant="secondary">
                            Filter
                        </Button>
                    </form>
                </Card>

                <Card className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                        Roles
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                        Last login
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                                            {user.name}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                                            {user.email}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <StatusBadge status={user.status} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.length > 0 ? (
                                                    user.roles.map((role) => (
                                                        <Badge
                                                            key={role.id}
                                                            tone="info"
                                                            className="flex items-center gap-1"
                                                        >
                                                            <Shield className="h-3 w-3" />
                                                            {role.label}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                                            {formatDateTime(user.last_login_at)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                            <div className="flex justify-end gap-2">
                                                <LinkButton href={`/admin/users/${user.id}`} variant="ghost" size="sm">
                                                    View
                                                </LinkButton>
                                                <LinkButton
                                                    href={`/admin/users/${user.id}/edit`}
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    Edit
                                                </LinkButton>
                                                {currentUserId && user.id !== 1 && user.id !== currentUserId && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (confirm(`Are you sure you want to delete ${user.name}?`)) {
                                                                router.delete(`/admin/users/${user.id}`);
                                                            }
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {users.meta.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
                            <p className="text-sm text-slate-600">
                                Showing {users.meta.from} to {users.meta.to} of {users.meta.total} results
                            </p>
                            <div className="flex gap-2">
                                {users.meta.links
                                    .filter((link) => !isNaN(Number(link.label)))
                                    .map((link) => (
                                        <button
                                            key={link.label}
                                            type="button"
                                            disabled={link.url === null}
                                            onClick={() =>
                                                router.get(
                                                    users.meta.path,
                                                    { page: Number(link.label) },
                                                    { preserveState: true },
                                                )
                                            }
                                            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50'
                                            }`}
                                            aria-label={`Page ${link.label}`}
                                            aria-current={link.active ? 'page' : undefined}
                                        >
                                            {link.label}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'active') {
        return <Badge tone="success">Active</Badge>;
    }

    return <Badge tone="danger">Inactive</Badge>;
}

function formatDateTime(value: string | null): string {
    if (!value) {
        return 'Never';
    }

    return new Date(value).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
