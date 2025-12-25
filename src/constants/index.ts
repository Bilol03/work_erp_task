export enum ProductTrackingType {
  SIMPLE = 'SIMPLE',
  EXPIRABLE = 'EXPIRABLE',
  SERIALIZED = 'SERIALIZED',
  LOT_TRACKED = 'LOT_TRACKED',
  VARIANT = 'VARIANT',
}

export interface TrackingInfo {
  expiration_date?: Date;
  lot_code?: string;
  serial_numbers?: string[];
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}
