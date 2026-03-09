import React, { useState, useEffect } from 'react';
import { Grow, Paper } from '@mui/material';

export function AnimatedField({
    delay,
    children,
}: {
    delay: number;
    children: React.ReactNode;
}) {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setShow(true), delay);
        return () => clearTimeout(t);
    }, [delay]);

    return (
        <Grow in={show} timeout={600}>
            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    borderRadius: '14px',
                    border: '1px solid rgba(25, 118, 210, 0.12)',
                    bgcolor: 'rgba(255,255,255,0.85)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 30px rgba(25, 118, 210, 0.15)',
                        borderColor: 'rgba(25, 118, 210, 0.35)',
                    },
                }}
            >
                {children}
            </Paper>
        </Grow>
    );
}
