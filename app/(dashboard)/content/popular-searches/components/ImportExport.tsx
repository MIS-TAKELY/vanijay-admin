'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Download } from 'lucide-react';
import { toast } from 'sonner';
import { mutate } from 'swr';

const ImportExport = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        window.open('/api/admin/popular-searches/bulk', '_blank');
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const text = await file.text();
        // Simple CSV parse
        const rows = text.split('\n').map(line => {
            // Handle quotes loosely (remove wrapping quotes)
            return line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
        }).filter(row => row.length > 0);

        try {
            const res = await fetch('/api/admin/popular-searches/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows })
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed');

            toast.success(`Imported ${json.count} keywords`);
            mutate('/api/admin/popular-searches'); // Refresh
        } catch (error) {
            toast.error('Import failed');
        }

        // Reset
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="flex gap-2">
            <input
                type="file"
                accept=".csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImport}
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" /> Import CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
        </div>
    );
};

export default ImportExport;
