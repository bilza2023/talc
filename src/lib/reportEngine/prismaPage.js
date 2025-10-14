// Generic Prisma offset pagination (+1 fetch trick)
// Usage: paginateQuery(prisma.stockTransport, { where, orderBy, page, pageSize, select?, include? })

export async function paginateQuery(delegate, opts = {}) {
    const {
      where = {},
      orderBy = [{ createdAt: 'desc' }, { id: 'desc' }],
      page = 1,
      pageSize = 25,
      select = undefined,
      include = undefined,
      totalMode = 'none', // 'none' | 'count'
    } = opts;
  
    const skip = (page - 1) * pageSize;
    const take = pageSize + 1; // +1 → detect hasNext without full count
  
    const rowsPlus = await delegate.findMany({ where, orderBy, skip, take, select, include });
    const hasNext = rowsPlus.length > pageSize;
    const rows = hasNext ? rowsPlus.slice(0, pageSize) : rowsPlus;
  
    let total = null;
    if (totalMode === 'count') {
      total = await delegate.count({ where });
    }
  
    const paging = {
      page,
      pageSize,
      total,          // may be null when totalMode='none'
      hasPrev: page > 1,
      hasNext,
    };
  
    return { rows, paging };
  }
  