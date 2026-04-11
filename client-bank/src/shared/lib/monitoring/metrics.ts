type Metrics = {
  success: number;
  failure: number;
};

const metricsMap = new Map<string, Metrics>();

export const updateMetrics = (key: string, isError: boolean) => {
  const current = metricsMap.get(key) || { success: 0, failure: 0 };

  if (isError) {
    current.failure++;
  } else {
    current.success++;
  }

  metricsMap.set(key, current);
};

export const getErrorPercentage = (key: string): number => {
  const m = metricsMap.get(key);
  if (!m) return 0;

  const total = m.success + m.failure;
  if (total === 0) return 0;

  return m.failure / total;
};