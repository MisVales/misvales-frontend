import { HttpParams } from '@angular/common/http';

export type QueryParamValue = boolean | number | string | null | undefined;

export function toHttpParams(values: Readonly<Record<string, QueryParamValue>>): HttpParams {
  return Object.entries(values).reduce((params, [name, value]) => {
    if (value === null || value === undefined || value === '') {
      return params;
    }

    return params.set(name, String(value));
  }, new HttpParams());
}
