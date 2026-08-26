import { useMemo, useState } from 'react';
import { TableSkeleton } from './Skeleton';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  pageSize = 10,
  emptyMessage = 'No records found.',
  className = '',
  keyField = 'id',
}) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (valA == null) valA = '';
      if (valB == null) valB = '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, safeCurrentPage, itemsPerPage]);

  if (loading) {
    return (
      <div className={`reusable-data-table-wrapper ${className}`}>
        <TableSkeleton rows={pageSize > 5 ? 5 : pageSize} cols={columns.length || 4} />
      </div>
    );
  }

  return (
    <div className={`reusable-data-table-wrapper ${className}`}>
      <div className="admin-table-container">
        <table className="admin-data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.label}
                  className={col.sortable !== false ? 'sortable-header' : ''}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={col.style}
                >
                  <div className="table-header-cell">
                    <span>{col.label}</span>
                    {col.sortable !== false && (
                      <span className="sort-icon">
                        {sortColumn === col.key
                          ? sortDirection === 'asc'
                            ? ' ▲'
                            : ' ▼'
                          : ' ↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr key={row[keyField] || index}>
                {columns.map((col) => (
                  <td key={col.key || col.label}>
                    {col.render ? col.render(row, index) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="admin-empty-table">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {sortedData.length > 0 && (
        <div className="table-pagination-footer">
          <div className="pagination-info">
            Showing {(safeCurrentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(safeCurrentPage * itemsPerPage, sortedData.length)} of{' '}
            {sortedData.length} records
          </div>

          <div className="pagination-controls">
            <div className="items-per-page-select">
              <label>
                Per page:
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </label>
            </div>

            <div className="page-nav-buttons">
              <button
                type="button"
                className="admin-btn-secondary"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                ← Prev
              </button>
              <span className="page-indicator">
                Page <strong>{safeCurrentPage}</strong> of <strong>{totalPages}</strong>
              </span>
              <button
                type="button"
                className="admin-btn-secondary"
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
