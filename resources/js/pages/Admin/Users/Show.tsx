import { router, usePage } from '@inertiajs/react';
import { Mail, Shield } from 'lucide-react';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import LinkButton from '../../../components/LinkButton';
import AdminLayout from '../../../layouts/AdminLayout';
import type { AdminUser, PageProps } from '../../../types';

interface ShowUserPageProps extends PageProps {
    user: AdminUser;
}

export default function Show() {
    const { user } = usePage<ShowUserPageProps>().props;
    const roles = user.roles ?? [];

    function handleDelete() {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            router.delete(`/admin/users/${user.id}`);
        }
    }

    return (
        <AdminLayout title="User Details">
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-navy-950">User details</h1>
                    <LinkButton href="/admin/users" variant="outline">
                        Back
                    </LinkButton>
                </div>

                <Card className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold text-navy-950">{user.name}</h2>
                        <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="h-4 w-4" aria-hidden="true" />
                            {user.email}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <StatusBadge status={user.status} />
                        {roles.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {roles.map((role) => (
                                    <Badge key={role.id} tone="info" className="flex items-center gap-1">
                                        <Shield className="h-3 w-3" />
                                        {role.label}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <dl className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="font-medium text-slate-500">Last login</dt>
                            <dd className="mt-1 text-slate-900">{formatDateTime(user.last_login_at)}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-slate-500">Account created</dt>
                            <dd className="mt-1 text-slate-900">{formatDateTime(user.created_at)}</dd>
                        </div>
                    </dl>

                    <div className="flex gap-3 pt-4">
                        <LinkButton href={`/admin/users/${user.id}/edit`}>Edit</LinkButton>
                        <Button type="button" variant="outline" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
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
