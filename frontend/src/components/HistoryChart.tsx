import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { DataType } from '../types';

interface HistoryChartProps {
    data: any[];
    type: DataType;
    color: string;
    loading?: boolean;
}

export default function HistoryChart({ data, type, color, loading }: HistoryChartProps) {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Sort by date just in case
        return [...data]
            .sort((a, b) => new Date(a.effective_date).getTime() - new Date(b.effective_date).getTime())
            .map(item => ({
                date: item.effective_date,
                // Handle different value key names from different tables if necessary, 
                // but our API standardizes on returning the raw DB row usually.
                // The DB columns are 'rate' or 'rate_to_usd' usually.
                value: item.rate !== undefined ? item.rate : (item.rate_to_usd !== undefined ? item.rate_to_usd : item.value),
                year: new Date(item.effective_date).getFullYear(),
            }));
    }, [data]);

    const formatYAxis = (val: number) => {
        if (type === 'exchange') return val.toFixed(2);
        return `${val}%`;
    };

    const formatTooltip = (val: number | undefined) => {
        if (val === undefined) return ['N/A', 'Rate'];
        if (type === 'exchange') return [val.toFixed(4), 'Rate'];
        return [`${val.toFixed(2)}%`, 'Rate'];
    };

    if (loading) {
        return (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                Loading history...
            </div>
        );
    }

    if (chartData.length === 0) {
        return (
            <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontStyle: 'italic', fontSize: '13px' }}>
                No historical data available
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: 220, fontSize: '12px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis
                        dataKey="year"
                        tick={{ fontSize: 10, fill: '#666' }}
                        tickLine={false}
                        axisLine={{ stroke: '#ddd' }}
                    />
                    <YAxis
                        tickFormatter={formatYAxis}
                        tick={{ fontSize: 10, fill: '#666' }}
                        tickLine={false}
                        axisLine={{ stroke: '#ddd' }}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        formatter={formatTooltip}
                        labelStyle={{ color: '#666' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        dot={{ r: 2, fill: color }}
                        activeDot={{ r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
