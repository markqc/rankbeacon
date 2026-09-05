import { useForm, usePage } from '@inertiajs/react';
import { type FormEvent } from 'react';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import FormField from '../../../components/FormField';
import LinkButton from '../../../components/LinkButton';
import TextInput from '../../../components/TextInput';
import AdminLayout from '../../../layouts/AdminLayout';
import type { PageProps, Role } from '../../../types';

interface CreateUserPageProps extends PageProps {
    roles: Role[];
}

export default function Create() {
    const { roles } = usePage<CreateUserPageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        status: 'active',
        roles: [] as number[],
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/admin/users');
    }

    function toggleRole(id: number) {
        setData('roles', data.roles.includes(id) ? data.roles.filter((roleId) => roleId !== id) : [...data.roles, id]);
    }

    return (
        <AdminLayout title="Create User">
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-navy-950">Create user</h1>
                    <LinkButton href="/admin/users" variant="outline">
                        Back
                    </LinkButton>
                </div>

                <Card>
                    <form onSubmit={submit} className="space-y-6">
                        <FormField label="Full name" htmlFor="name" error={errors.name}>
                            <TextInput
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoFocus
                            />
                        </FormField>

                        <FormField label="Email" htmlFor="email" error={errors.email}>
                            <TextInput
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                        </FormField>

                        <FormField label="Status" htmlFor="status">
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as 'active' | 'inactive')}
                                className="w-full rounded-md border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </FormField>

                        <fieldset className="space-y-3">
                            <legend className="text-sm font-medium text-slate-700">Roles</legend>
                            {roles.length === 0 ? (
                                <p className="text-sm text-slate-500">No roles available.</p>
                            ) : (
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {roles.map((role) => (
                                        <label
                                            key={role.id}
                                            className="flex items-center gap-3 rounded-md border border-slate-200 p-3 hover:bg-slate-50"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={data.roles.includes(role.id)}
                                                onChange={() => toggleRole(role.id)}
                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-700">{role.label}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </fieldset>

                        <div className="flex items-center justify-end gap-3">
                            <LinkButton href="/admin/users" variant="outline">
                                Cancel
                            </LinkButton>
                            <Button type="submit" disabled={processing}>
                                Create user
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AdminLayout>
    );
}
