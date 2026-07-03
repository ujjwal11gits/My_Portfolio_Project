import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DonutChart({
  easy = 0,
  medium = 0,
  hard = 0,
  total,
  items,
  centerLabel = 'Solved',
}) {
  let labels = ['Easy', 'Medium', 'Hard'];
  let values = [easy, medium, hard];
  let colors = ['#10b981', '#f59e0b', '#ef4444'];

  if (items && items.length > 0) {
    labels = items.map(i => i.label);
    values = items.map(i => i.value);
    colors = items.map(i => i.color || '#8b5cf6');
  }

  const computedTotal = total !== undefined
    ? total
    : values.reduce((a, b) => a + b, 0);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: ['#05050f', '#05050f', '#05050f', '#05050f'],
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0d0d1f',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(139,92,246,0.2)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="donut-chart-container">
      <div style={{ width: 170, height: 170, position: 'relative', margin: '0 auto' }}>
        <Doughnut data={chartData} options={options} />
        <div className="donut-center-text">
          <span className="donut-total mono">{computedTotal}</span>
          <span className="donut-label">{centerLabel}</span>
        </div>
      </div>
      <div className="donut-legend">
        {items && items.length > 0 ? (
          items.map((item, idx) => (
            <div key={idx} className="legend-item">
              <span className="dot" style={{ backgroundColor: item.color || '#8b5cf6' }} />
              <span className="legend-name">{item.label}:</span>
              <strong>{item.value}</strong>
            </div>
          ))
        ) : (
          <>
            <div className="legend-item"><span className="dot easy" /> Easy: <strong>{easy}</strong></div>
            <div className="legend-item"><span className="dot medium" /> Med: <strong>{medium}</strong></div>
            <div className="legend-item"><span className="dot hard" /> Hard: <strong>{hard}</strong></div>
          </>
        )}
      </div>
    </div>
  );
}
