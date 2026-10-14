import { csvCell, toCSV } from '@/lib/csv'

describe('csvCell', () => {
  test('passes plain values through', () => {
    expect(csvCell('Ada')).toBe('Ada')
    expect(csvCell(1500.5)).toBe('1500.5')
  })

  test('renders null/undefined as empty', () => {
    expect(csvCell(null)).toBe('')
    expect(csvCell(undefined)).toBe('')
  })

  test('quotes commas, quotes and newlines', () => {
    expect(csvCell('Lekki, Lagos')).toBe('"Lekki, Lagos"')
    expect(csvCell('say "hi"')).toBe('"say ""hi"""')
    expect(csvCell('a\nb')).toBe('"a\nb"')
  })

  test('neutralises spreadsheet formulas', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`)
    expect(csvCell('+234')).toBe("'+234")
    expect(csvCell('@cmd')).toBe("'@cmd")
  })
})

describe('toCSV', () => {
  test('builds header and rows', () => {
    const csv = toCSV(
      [{ name: 'Ada', total: 100 }, { name: 'Obi, J', total: 2.5 }],
      [{ header: 'Name', value: r => r.name }, { header: 'Total', value: r => r.total }],
    )
    expect(csv).toBe('Name,Total\r\nAda,100\r\n"Obi, J",2.5')
  })
})
