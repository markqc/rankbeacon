import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { PageProps } from '../../types';
import Alert from '../Alert';

export default function FlashMessages() {
    const { props } = usePage<PageProps>();
    const [success, setSuccess] = useState<string | undefined>(props.flash.success);
    const [error, setError] = useState<string | undefined>(props.flash.error);

    useEffect(() => {
        setSuccess(props.flash.success);
        setError(props.flash.error);
    }, [props.flash.success, props.flash.error]);

    if (!success && !error) {
        return null;
    }

    return (
        <div className="space-y-3 p-4 lg:p-6">
            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
        </div>
    );
}
