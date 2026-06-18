export const trackLatency = (name: string, ms: number) => {
  console.log(`[LATENCY] ${name}: ${ms}ms`);
};
