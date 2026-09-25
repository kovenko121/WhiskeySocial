/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
import { CrudSorting } from '@refinedev/core';

// eslint-disable-next-line consistent-return
export const generateSort = (sorters?: CrudSorting) => {
  if (sorters && sorters.length > 0) {
    const _sort: string[] = [];
    const _order: string[] = [];

    // eslint-disable-next-line array-callback-return
    sorters.map((item) => {
      _sort.push(item.field);
      _order.push(item.order);
    });

    return {
      _sort,
      _order,
    };
  }
};
