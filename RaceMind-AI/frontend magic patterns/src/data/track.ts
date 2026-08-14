/** Stylised Monte Carlo layout, shared by the circuit map and telemetry replay. */
export const TRACK_PATH =
'M120 300 C 90 240, 110 170, 170 140 C 220 115, 280 130, 320 165 C 350 192, 372 210, 410 205 C 455 199, 470 160, 512 150 C 560 139, 610 160, 640 195 C 672 233, 690 262, 730 268 C 780 276, 820 250, 852 214 C 880 182, 900 150, 880 118 C 862 90, 820 92, 800 118 C 782 142, 800 176, 836 186 C 880 198, 920 230, 918 280 C 916 330, 872 356, 820 352 C 760 347, 720 320, 660 322 C 590 324, 545 360, 480 372 C 400 387, 330 372, 250 366 C 180 361, 140 348, 120 300 Z';

export const TRACK_VIEWBOX = '0 0 1000 480';

export const trackCorners = [
{ id: 'T1', name: 'Sainte Dévote', t: 0.06, x: 168, y: 141, apex: 92 },
{ id: 'T4', name: 'Massenet', t: 0.23, x: 411, y: 205, apex: 128 },
{ id: 'T7', name: 'Mirabeau', t: 0.42, x: 641, y: 196, apex: 74 },
{ id: 'T10', name: 'Portier', t: 0.58, x: 866, y: 112, apex: 61 },
{ id: 'T13', name: 'Tabac', t: 0.74, x: 916, y: 284, apex: 145 },
{ id: 'T16', name: 'Rascasse', t: 0.91, x: 480, y: 372, apex: 108 }];