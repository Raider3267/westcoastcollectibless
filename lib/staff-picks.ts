import { getListingsFromCsv, type Listing } from './listings'

export async function getStaffPicks(filename = 'export.csv'): Promise<Listing[]> {
  return getListingsFromCsv(filename, true).then(items =>
    items.filter(item => item.show_in_staff_picks && item.status === 'live')
  )
}

export async function getLimitedEditions(filename = 'export.csv'): Promise<Listing[]> {
  return getListingsFromCsv(filename, true).then(items =>
    items.filter(item => item.show_in_limited_editions && item.status === 'live')
  )
}