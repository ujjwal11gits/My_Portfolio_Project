import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Fallback rating trajectories if live API returns empty array
const FALLBACK_HISTORIES = {
  LEETCODE: [
    { date: '2025-01-12', rating: 1520 },
    { date: '2025-03-02', rating: 1585 },
    { date: '2025-05-18', rating: 1640 },
    { date: '2025-08-10', rating: 1695 },
    { date: '2025-11-23', rating: 1724 },
    { date: '2026-02-15', rating: 1754 },
  ],
  CODEFORCES: [
    { date: '2025-02-10', rating: 1040 },
    { date: '2025-04-15', rating: 1110 },
    { date: '2025-07-20', rating: 1165 },
    { date: '2025-10-14', rating: 1195 },
    { date: '2026-01-30', rating: 1218 },
  ],
  CODECHEF: [
    { date: '2025-01-20', rating: 1240 },
    { date: '2025-04-10', rating: 1380 },
    { date: '2025-08-25', rating: 1460 },
    { date: '2025-12-12', rating: 1520 },
  ],
};

export default function RatingChart({ history = [], platform = 'LEETCODE' }) {
  const platKey = platform.toUpperCase();
  const effectiveHistory = (history && history.length > 0)
    ? history
    : (FALLBACK_HISTORIES[platKey] || FALLBACK_HISTORIES.LEETCODE);

  const labels = effectiveHistory.map((h, i) =>
    h.date ? new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `Contest ${i + 1}`
  );
  const ratings = effectiveHistory.map(h => h.rating || h.newRating);

  const data = {
    labels,
    datasets: [
      {
        label: `${platform} Rating`,
        data: ratings,
        borderColor: '#06b6d4',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
          gradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.35,
        pointRadius: 5,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0d0d1f',
        titleColor: '#f1f5f9',
        bodyColor: '#67e8f9',
        borderColor: 'rgba(139,92,246,0.3)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => ` Rating: ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 11 } },
      },
    },
  };

  return (
    <div style={{ height: 280, width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}
