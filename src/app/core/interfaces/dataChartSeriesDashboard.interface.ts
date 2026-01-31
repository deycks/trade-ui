export interface DataPoint {
    x: Date;
    y: number;
}

export interface Series {
    name: string;
    data: DataPoint[];
}

export interface AnioSeries {
    [anio: string]: Series[];
}
