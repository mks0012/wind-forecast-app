export interface DataPoint {
  startTime: string;
  generation: number;
  publishTime?: string;
}

export const filterForecasts = (forecasts: DataPoint[], horizon: number): DataPoint[] => {
  const filtered: { [key: string]: DataPoint } = {};
  
  forecasts.forEach(f => {
    if (!f.startTime || !f.publishTime) return;

    const start = new Date(f.startTime);
    const publish = new Date(f.publishTime);
    
    // Calculate lead time in hours
    const diffHours = (start.getTime() - publish.getTime()) / (1000 * 60 * 60);
    
    // Check if it meets the slider requirement
    if (diffHours >= horizon) {
      // NORMALIZE: Round to nearest 30 mins to match Actuals
      const rounded = new Date(start);
      rounded.setSeconds(0, 0);
      const minutes = rounded.getMinutes();
      rounded.setMinutes(minutes < 30 ? 0 : 30);
      
      const key = rounded.toISOString();
      
      // Keep the latest published forecast for this specific slot
      if (!filtered[key] || new Date(f.publishTime).getTime() > new Date(filtered[key].publishTime!).getTime()) {
        filtered[key] = { 
          ...f, 
          startTime: key,
          generation: Number(f.generation) 
        };
      }
    }
  });
  
  return Object.values(filtered);
};