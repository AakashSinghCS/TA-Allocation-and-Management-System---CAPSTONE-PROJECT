export default interface PageableResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;             // current page (0-based)
  size: number;               // page size
}