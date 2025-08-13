import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './BarChart.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export interface BarChartProps {
  title?: string;
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor?: string }[];
  description?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ title, labels, datasets, description }) => {
  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: !!title, text: title },
      tooltip: { enabled: true },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true },
    },
  };

  return (
    <div className={styles.barChartContainer}>
      {description && <div className={styles.barChartDescription}>{description}</div>}
      <Bar data={data} options={options} />
    </div>
  );
};
