import AdminLayout from '../../../layouts/AdminLayout';

export default function Show() {
    return (
        <AdminLayout title="Activity Log Details">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-navy-950">Activity Log Details</h2>
                <p className="mt-2 text-sm text-slate-600">Log entry details will appear here.</p>
            </div>
        </AdminLayout>
    );
}
