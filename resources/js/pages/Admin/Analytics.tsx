import AdminLayout from '../../layouts/AdminLayout';

export default function Analytics() {
    return (
        <AdminLayout title="Analytics">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-navy-950">Analytics</h2>
                <p className="mt-2 text-sm text-slate-600">Date-range reports will appear here.</p>
            </div>
        </AdminLayout>
    );
}
