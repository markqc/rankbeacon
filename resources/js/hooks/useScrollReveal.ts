import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollReveal(): void {
    useLayoutEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const tweens: gsap.core.Tween[] = [];

        const staggerParents = gsap.utils.toArray<HTMLElement>('[data-reveal-stagger]');

        staggerParents.forEach((parent) => {
            const children = gsap.utils.toArray<HTMLElement>(parent.children);

            if (children.length > 0) {
                tweens.push(
                    gsap.from(children, {
                        y: 40,
                        opacity: 0,
                        duration: 0.7,
                        stagger: 0.15,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: parent,
                            start: 'top 80%',
                            toggleActions: 'play none none none',
                        },
                    }),
                );
            }
        });

        const elements = gsap.utils.toArray<HTMLElement>('[data-reveal]');

        elements.forEach((el) => {
            tweens.push(
                gsap.from(el, {
                    y: 40,
                    opacity: 0,
                    duration: 0.7,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    },
                }),
            );
        });

        if (tweens.length === 0) {
            return;
        }

        const raf = requestAnimationFrame(() => {
            ScrollTrigger.refresh();
        });

        return () => {
            cancelAnimationFrame(raf);
            tweens.forEach((tween) => {
                tween.scrollTrigger?.kill();
                tween.kill();
            });
        };
    }, []);
}
