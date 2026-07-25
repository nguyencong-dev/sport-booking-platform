export type SortResponse = {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
};

export type PageableResponse = {
  offset: number;
  sort: SortResponse;
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  unpaged: boolean;
};

export type PageResponse<T> = {
  content: T[];
  pageable: PageableResponse;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: SortResponse;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
};
