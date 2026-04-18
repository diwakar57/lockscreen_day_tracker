export interface Device {
  id: string;
  name: string;
  width: number;
  height: number;
  safeTop: number;
  safeBottom: number;
  safeSide: number;
}

export const DEVICES: Device[] = [
  // iPhone 17 Series
  { id: "iphone-17-pro-max", name: "iPhone 17 Pro Max", width: 1320, height: 2868, safeTop: 920, safeBottom: 500, safeSide: 110 },
  { id: "iphone-17-pro", name: "iPhone 17 Pro", width: 1206, height: 2622, safeTop: 870, safeBottom: 500, safeSide: 100 },
  { id: "iphone-17-plus", name: "iPhone 17 Plus / Air", width: 1290, height: 2796, safeTop: 900, safeBottom: 500, safeSide: 110 },
  { id: "iphone-17", name: "iPhone 17", width: 1179, height: 2556, safeTop: 850, safeBottom: 500, safeSide: 100 },
  // iPhone 16 Series
  { id: "iphone-16-pro-max", name: "iPhone 16 Pro Max", width: 1320, height: 2868, safeTop: 920, safeBottom: 500, safeSide: 110 },
  { id: "iphone-16-pro", name: "iPhone 16 Pro", width: 1206, height: 2622, safeTop: 870, safeBottom: 500, safeSide: 100 },
  { id: "iphone-16-plus", name: "iPhone 16 Plus", width: 1290, height: 2796, safeTop: 900, safeBottom: 500, safeSide: 110 },
  { id: "iphone-16", name: "iPhone 16", width: 1179, height: 2556, safeTop: 850, safeBottom: 500, safeSide: 100 },
  // iPhone 15 Series
  { id: "iphone-15-pro-max", name: "iPhone 15 Pro Max", width: 1290, height: 2796, safeTop: 900, safeBottom: 500, safeSide: 110 },
  { id: "iphone-15-pro", name: "iPhone 15 Pro", width: 1179, height: 2556, safeTop: 850, safeBottom: 500, safeSide: 100 },
  { id: "iphone-15-plus", name: "iPhone 15 Plus", width: 1290, height: 2796, safeTop: 900, safeBottom: 500, safeSide: 110 },
  { id: "iphone-15", name: "iPhone 15", width: 1179, height: 2556, safeTop: 850, safeBottom: 500, safeSide: 100 },
  // iPhone 14 Series
  { id: "iphone-14-pro-max", name: "iPhone 14 Pro Max", width: 1290, height: 2796, safeTop: 900, safeBottom: 500, safeSide: 110 },
  { id: "iphone-14-pro", name: "iPhone 14 Pro", width: 1179, height: 2556, safeTop: 850, safeBottom: 500, safeSide: 100 },
  { id: "iphone-14-plus", name: "iPhone 14 Plus", width: 1284, height: 2778, safeTop: 850, safeBottom: 500, safeSide: 110 },
  { id: "iphone-14", name: "iPhone 14", width: 1170, height: 2532, safeTop: 800, safeBottom: 500, safeSide: 100 },
  // iPhone 13 Series
  { id: "iphone-13-pro-max", name: "iPhone 13 Pro Max", width: 1284, height: 2778, safeTop: 850, safeBottom: 500, safeSide: 110 },
  { id: "iphone-13-pro", name: "iPhone 13 Pro", width: 1170, height: 2532, safeTop: 800, safeBottom: 500, safeSide: 100 },
  { id: "iphone-13", name: "iPhone 13", width: 1170, height: 2532, safeTop: 800, safeBottom: 500, safeSide: 100 },
  { id: "iphone-13-mini", name: "iPhone 13 mini", width: 1080, height: 2340, safeTop: 750, safeBottom: 450, safeSide: 90 },
];
