/**
 * Basic Skeleton Block with shimmer effect
 */
export function Skeleton({ width = '100%', height = '20px', borderRadius = '6px', className = '', style = {} }) {
  return (
    <div
      className={`skeleton-box ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

/**
 * Stat Card Skeleton
 */
export function StatCardSkeleton({ count = 4 }) {
  return (
    <div className="skeleton-stats-grid" aria-label="Loading statistics" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="portal-stat-card skeleton-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <Skeleton width="60%" height="16px" />
            <Skeleton width="32px" height="32px" borderRadius="50%" />
          </div>
          <Skeleton width="80%" height="28px" style={{ marginBottom: '8px' }} />
          <Skeleton width="40%" height="14px" />
        </div>
      ))}
    </div>
  );
}

/**
 * Table Loading Skeleton
 */
export function TableSkeleton({ rows = 5, cols = 4, showHeader = true }) {
  return (
    <div className="skeleton-table-wrapper" aria-label="Loading table data" aria-busy="true">
      {showHeader && (
        <div className="skeleton-table-header">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} width={`${85 / cols}%`} height="18px" />
          ))}
        </div>
      )}
      <div className="skeleton-table-body">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="skeleton-table-row">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                width={c === 0 ? '40%' : c === 1 ? '70%' : '50%'}
                height="16px"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Card Loading Skeleton
 */
export function CardSkeleton({ count = 1 }) {
  return (
    <div className="skeleton-cards-container" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="portal-card skeleton-card" style={{ padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
            <Skeleton width="48px" height="48px" borderRadius="8px" />
            <div style={{ flex: 1 }}>
              <Skeleton width="40%" height="20px" style={{ marginBottom: '6px' }} />
              <Skeleton width="65%" height="14px" />
            </div>
          </div>
          <Skeleton width="100%" height="14px" style={{ marginBottom: '8px' }} />
          <Skeleton width="90%" height="14px" style={{ marginBottom: '8px' }} />
          <Skeleton width="60%" height="14px" />
        </div>
      ))}
    </div>
  );
}

/**
 * Complete Dashboard Skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton-view" aria-label="Loading dashboard content" aria-busy="true">
      {/* Summary Banner Skeleton */}
      <div className="portal-card skeleton-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <Skeleton width="30%" height="28px" style={{ marginBottom: '10px' }} />
        <Skeleton width="60%" height="16px" style={{ marginBottom: '18px' }} />
        <div style={{ display: 'flex', gap: '12px' }}>
          <Skeleton width="140px" height="36px" borderRadius="6px" />
          <Skeleton width="140px" height="36px" borderRadius="6px" />
        </div>
      </div>

      {/* Stat Grid Skeleton */}
      <StatCardSkeleton count={4} />

      {/* Main Grid Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginTop: '24px' }}>
        <div className="portal-card skeleton-card" style={{ padding: '24px' }}>
          <Skeleton width="40%" height="22px" style={{ marginBottom: '20px' }} />
          <TableSkeleton rows={4} cols={3} />
        </div>
        <div className="portal-card skeleton-card" style={{ padding: '24px' }}>
          <Skeleton width="50%" height="22px" style={{ marginBottom: '20px' }} />
          <CardSkeleton count={2} />
        </div>
      </div>
    </div>
  );
}
