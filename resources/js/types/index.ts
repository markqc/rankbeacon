import type { PageProps as InertiaPageProps } from '@inertiajs/core';

export interface PageProps extends InertiaPageProps {
    app: {
        name: string;
        url: string;
        env: string;
    };
}
