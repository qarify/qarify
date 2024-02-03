//@ts-expect-error
process.browser=true
//@ts-expect-error
delete process.versions.node

export * from '@qarify/types';
export * from '@qarify/logger';
export * from '@qarify/drivers';
export * from '@qarify/pages';
