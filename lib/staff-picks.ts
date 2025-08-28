import { getListingsFromCsv, type Listing } from './listings'

export async function getStaffPicks(filename = 'export.csv'): Promise<Listing[]> {
  return getListingsFromCsv(filename, true).then(items =>
    items.filter((item: any) => item.staff_pick && item.status === 'live')
  )
}

export async function getLimitedEditions(filename = 'export.csv'): Promise<Listing[]> {
  return getListingsFromCsv(filename, true).then(items =>
    items.filter((item: any) => item.limited_edition && item.status === 'live')
  )
}