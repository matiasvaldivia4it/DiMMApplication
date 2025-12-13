import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Analytics = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [trends, setTrends] = useState(null);
    const [patterns, setPatterns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        loadAnalytics();
    }, [days]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const [trendsData, patternsData] = await Promise.all([
                analyticsService.getTrends(user.id, days),
                analyticsService.getPatterns(user.id, days),
            ]);
            setTrends(trendsData);
            setPatterns(patternsData.patterns);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        try {
            const blob = await analyticsService.exportPDF(user.id, days);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte-diabetes-${days}dias.pdf`;
            a.click();
        } catch (error) {
            console.error('Error exporting PDF:', error);
        }
    };

    const chartData = trends?.dailySummaries
        ? {
            labels: trends.dailySummaries.map((s) => s.date),
            datasets: [
                {
                    label: 'Glucemia Promedio',
                    data: trends.dailySummaries.map((s) => s.avgGlucose),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                },
            ],
        }
        : null;

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Tendencia de Glucemia',
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                min: 50,
                max: 200,
            },
        },
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-6">
            <div className="gradient-primary text-white p-6">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-white/20 rounded-lg transition"
                    >
                        ←
                    </button>
                    <h1 className="text-2xl font-bold">Analytics</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {[7, 14, 30, 60, 90].map((d) => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${days === d
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-700 border-2 border-gray-200'
                                }`}
                        >
                            {d} días
                        </button>
                    ))}
                </div>

                {trends && (
                    <>
                        <div className="card">
                            <h2 className="text-lg font-semibold mb-4">Resumen del Período</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-600">Carbohidratos Promedio</p>
                                    <p className="text-2xl font-bold text-blue-900">
                                        {trends.trends.avgCarbs}g
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <p className="text-sm text-purple-600">Insulina Promedio</p>
                                    <p className="text-2xl font-bold text-purple-900">
                                        {trends.trends.avgInsulin}u
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-600">Glucemia Promedio</p>
                                    <p className="text-2xl font-bold text-green-900">
                                        {trends.trends.avgGlucose || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {chartData && (
                            <div className="card">
                                <Line data={chartData} options={chartOptions} />
                            </div>
                        )}
                    </>
                )}

                {patterns.length > 0 && (
                    <div className="card">
                        <h2 className="text-lg font-semibold mb-4">Patrones Detectados</h2>
                        <div className="space-y-3">
                            {patterns.map((pattern, index) => {
                                const severityColors = {
                                    high: 'bg-red-50 border-red-200 text-red-800',
                                    medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                                    low: 'bg-blue-50 border-blue-200 text-blue-800',
                                };

                                return (
                                    <div
                                        key={index}
                                        className={`p-4 border-2 rounded-lg ${severityColors[pattern.severity]}`}
                                    >
                                        <p className="font-medium">{pattern.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <button
                    onClick={handleExportPDF}
                    className="btn-primary w-full"
                >
                    📄 Exportar Reporte PDF
                </button>
            </div>
        </div>
    );
};

export default Analytics;
