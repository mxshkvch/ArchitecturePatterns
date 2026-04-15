import { useEffect } from "react";
import Button from "react-bootstrap/Button";

interface MetricsPageProps {
  onNavigateToLogs: () => void;
}

export default function MetricsPage({ onNavigateToLogs }: MetricsPageProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.async = true;
    script.onload = () => {
      initCharts();
      fetchMetrics();
      startAutoRefresh();
    };
    document.head.appendChild(script);

    const style = document.createElement('style');
    style.textContent = `
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }
      .stat-card {
        background: white;
        border-radius: 15px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
        cursor: pointer;
      }
      .stat-card:hover {
        transform: translateY(-5px);
      }
      .stat-title {
        color: #666;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 10px;
      }
      .stat-value {
        font-size: 36px;
        font-weight: bold;
        color: #333;
      }
      .stat-unit {
        font-size: 14px;
        color: #999;
        margin-left: 5px;
      }
      .error-card .stat-value {
        color: #e74c3c;
      }
      .success-card .stat-value {
        color: #27ae60;
      }
      .chart-container {
        background: white;
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 30px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      }
      .chart-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 20px;
        color: #333;
        border-left: 4px solid #667eea;
        padding-left: 15px;
      }
      .charts-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 30px;
      }
      @media (max-width: 768px) {
        .charts-row {
          grid-template-columns: 1fr;
        }
      }
      canvas {
        max-height: 300px;
      }
    `;
    document.head.appendChild(style);

    let requestsChart: any, durationChart: any, errorChart: any;
    let autoRefreshInterval: any;

    function initCharts() {
      const ctx1 = (document.getElementById('requestsChart') as HTMLCanvasElement)?.getContext('2d');
      const ctx2 = (document.getElementById('durationChart') as HTMLCanvasElement)?.getContext('2d');
      const ctx3 = (document.getElementById('errorChart') as HTMLCanvasElement)?.getContext('2d');

      if (ctx1 && ctx2 && ctx3 && (window as any).Chart) {
        const Chart = (window as any).Chart;
        
        requestsChart = new Chart(ctx1, {
          type: 'bar',
          data: {
            labels: ['Total Requests', 'Errors'],
            datasets: [{
              label: 'Количество',
              data: [0, 0],
              backgroundColor: ['#3498db', '#e74c3c'],
              borderColor: ['#2980b9', '#c0392b'],
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: { position: 'top' }
            }
          }
        });

        durationChart = new Chart(ctx2, {
          type: 'line',
          data: {
            labels: ['Min', 'Avg', 'Max'],
            datasets: [{
              label: 'Длительность (мс)',
              data: [0, 0, 0],
              borderColor: '#f39c12',
              backgroundColor: 'rgba(243, 156, 18, 0.1)',
              tension: 0.4,
              fill: true,
              pointRadius: 6,
              pointBackgroundColor: '#f39c12'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context: any) {
                    return context.parsed.y.toFixed(2) + ' мс';
                  }
                }
              }
            }
          }
        });

        errorChart = new Chart(ctx3, {
          type: 'doughnut',
          data: {
            labels: ['Успешные запросы', 'Ошибки'],
            datasets: [{
              data: [0, 0],
              backgroundColor: ['#27ae60', '#e74c3c'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context: any) {
                    const label = context.label || '';
                    const value = context.parsed;
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          }
        });
      }
    }

    async function fetchMetrics() {
      try {
        const response = await fetch('http://89.23.105.66:5300/api/monitoring/metrics');
        const data = await response.json();
        updateStatsCards(data);
        updateCharts(data);
        document.getElementById('timestamp')!.innerHTML = `Последнее обновление: ${new Date().toLocaleString()}`;
      } catch (error) {
        console.error('Ошибка получения метрик:', error);
        document.getElementById('timestamp')!.innerHTML = '❌ Ошибка подключения к серверу мониторинга';
      }
    }

    function updateStatsCards(data: any) {
      const statsGrid = document.getElementById('statsGrid');
      if (statsGrid) {
        statsGrid.innerHTML = `
          <div class="stat-card">
            <div class="stat-title">📊 Всего запросов</div>
            <div class="stat-value">${data.totalRequests}</div>
          </div>
          <div class="stat-card error-card">
            <div class="stat-title">❌ Количество ошибок</div>
            <div class="stat-value">${data.errorCount}</div>
          </div>
          <div class="stat-card error-card">
            <div class="stat-title">⚠️ Процент ошибок</div>
            <div class="stat-value">${data.errorPercentage.toFixed(1)}<span class="stat-unit">%</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-title">⚡ Среднее время ответа</div>
            <div class="stat-value">${data.avgDurationMs.toFixed(2)}<span class="stat-unit">мс</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-title">🚀 Максимальное время</div>
            <div class="stat-value">${data.maxDurationMs.toFixed(2)}<span class="stat-unit">мс</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-title">⚡ Минимальное время</div>
            <div class="stat-value">${data.minDurationMs.toFixed(2)}<span class="stat-unit">мс</span></div>
          </div>
        `;
      }
    }

    function updateCharts(data: any) {
      if (requestsChart) {
        requestsChart.data.datasets[0].data = [data.totalRequests, data.errorCount];
        requestsChart.update();
      }
      if (durationChart) {
        durationChart.data.datasets[0].data = [data.minDurationMs, data.avgDurationMs, data.maxDurationMs];
        durationChart.update();
      }
      if (errorChart) {
        const successCount = data.totalRequests - data.errorCount;
        errorChart.data.datasets[0].data = [successCount, data.errorCount];
        errorChart.update();
      }
    }

    function startAutoRefresh() {
      if (autoRefreshInterval) clearInterval(autoRefreshInterval);
      autoRefreshInterval = setInterval(fetchMetrics, 10000);
    }

    return () => {
      if (autoRefreshInterval) clearInterval(autoRefreshInterval);
      if (requestsChart) requestsChart.destroy();
      if (durationChart) durationChart.destroy();
      if (errorChart) errorChart.destroy();
    };
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="outline-secondary" onClick={onNavigateToLogs}>
          ← Назад к логам
        </Button>
      </div>
      
      <div className="stats-grid" id="statsGrid"></div>
      
      <div className="charts-row">
        <div className="chart-container">
          <div className="chart-title">📈 Запросы vs Ошибки</div>
          <canvas id="requestsChart"></canvas>
        </div>
        <div className="chart-container">
          <div className="chart-title">⏱️ Длительность ответов (мс)</div>
          <canvas id="durationChart"></canvas>
        </div>
      </div>
      
      <div className="chart-container">
        <div className="chart-title">🎯 Процент ошибок</div>
        <canvas id="errorChart"></canvas>
      </div>
      
      <div className="text-center text-muted mt-4 small" id="timestamp"></div>
    </div>
  );
}