create type user_role as enum (
  'USER',
  'OPERATOR',
  'OWNER',
  'ADMIN'
);

create type booking_status as enum (
  'PENDING_APPROVAL',
  'APPROVED',
  'PAYMENT_PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'CHECKED_OUT',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
  'EXPIRED',
  'NO_SHOW',
  'OVERSTAY',
  'REFUNDED'
);

create type payment_status as enum (
  'PENDING',
  'SUCCEEDED',
  'FAILED',
  'EXPIRED',
  'CANCELLED',
  'REFUNDED'
);

create type payment_gateway as enum (
  'MOCK'
);

create type office_status as enum (
  'ACTIVE',
  'INACTIVE',
  'MAINTENANCE'
);

create type device_type as enum (
  'SMART_LOCK',
  'AIR_QUALITY_SENSOR',
  'ELECTRICITY_METER'
);

create type device_status as enum (
  'ONLINE',
  'OFFLINE',
  'MAINTENANCE',
  'ERROR'
);

create type access_event_status as enum (
  'PENDING_ACK',
  'ACKED',
  'FAILED_NO_ACK',
  'DENIED',
  'MANUAL_OVERRIDE',
  'REVOKED'
);

create type access_method as enum (
  'QR_SCAN',
  'APP_UNLOCK',
  'MANUAL_OVERRIDE'
);

create type incident_type as enum (
  'DEVICE_OFFLINE',
  'ACCESS_DENIED',
  'FORCED_ENTRY',
  'SENSOR_ANOMALY',
  'MANUAL_OVERRIDE',
  'SYSTEM_ERROR'
);

create type incident_status as enum (
  'OPEN',
  'ACKNOWLEDGED',
  'RESOLVED',
  'CANCELLED'
);

create type notification_type as enum (
  'BOOKING_CREATED',
  'BOOKING_APPROVED',
  'BOOKING_REJECTED',
  'BOOKING_CANCELLED',
  'PAYMENT_PENDING',
  'PAYMENT_SUCCEEDED',
  'PAYMENT_FAILED',
  'QR_READY',
  'ACCESS_GRANTED',
  'ACCESS_DENIED',
  'NO_SHOW',
  'OVERSTAY',
  'DEVICE_OFFLINE',
  'INCIDENT_CREATED',
  'SYSTEM_MESSAGE'
);

create type actor_type as enum (
  'USER',
  'ADMIN',
  'OWNER',
  'OPERATOR',
  'JOB',
  'SYSTEM'
);
