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

const PLATFORM_COLORS = {
  LEETCODE:   { line: '#f59e0b', grad: 'rgba(245,158,11,' },
  CODEFORCES: { line: '#06b6d4', grad: 'rgba(6,182,212,'  },
  CODECHEF:   { line: '#10b981', grad: 'rgba(16,185,129,' },
};

export default function RatingChart({ history = [], platform = 'LEETCODE', loading = false }) {
  const platKey = platform.toUpperCase();
  const colors  = PLATFORM_COLORS[platKey] || PLATFORM_COLORS.LEETCODE;

  // No fake fallback — show empty state if no real data
  if (loading) {
    return (
      <div style={{ height: 280, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading contest history...</span>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div style={{
        height: 280, width: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
      }}>
        <span style={{ fontSize: '2rem' }}>📊</span>
        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
          No contest history available for {platform}
        </span>
        <span style={{ color: '#475569', fontSize: '0.78rem' }}>
          Participate in rated contests to see your rating progression here
        </span>
      </div>
    );
  }

  const labels  = history.map((h, i) => {
    if (h.date) {
      const d = new Date(h.date);
      return isNaN(d) ? `#${i + 1}` : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    return `#${i + 1}`;
  });
  const ratings = history.map(h => h.rating || h.newRating || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: `${platform} Rating`,
        data: ratings,
        borderColor: colors.line,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, `${colors.grad}0.35)`);
          gradient.addColorStop(1, `${colors.grad}0.0)`);
          return gradient;
        },
        fill: true,
        tension: 0.35,
        pointRadius: history.length > 20 ? 3 : 5,
        pointBackgroundColor: colors.line,
        pointBorderColor: '#fff',
        pointHoverRadius: 8,
        borderWidth: 2,
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
          title: (ctx) => {
            const h = history[ctx[0].dataIndex];
            return h?.title || h?.contestName || labels[ctx[0].dataIndex];
          },
          label: (ctx) => ` Rating: ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#94a3b8',
          font: { family: 'JetBrains Mono, monospace', size: 10 },
          maxRotation: 45,
          maxTicksLimit: 12,
        },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono, monospace', size: 11 } },
      },
    },
  };

  return (
    <div style={{ height: 280, width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
