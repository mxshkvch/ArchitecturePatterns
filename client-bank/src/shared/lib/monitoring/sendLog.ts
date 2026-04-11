import axios from "axios";

const MONITORING_URL = "http://89.23.105.66:5300/api/monitoring/logs";

export const sendMonitoringLog = (payload: any) => {
  console.log("Monitoring payload:", payload);

  void axios.post(MONITORING_URL, payload).catch((e) => {
    console.warn("Monitoring log failed", e);
  });
};