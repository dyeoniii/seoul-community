import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '..', 'src', 'data')

const CATEGORIES = [
  { id: 'tourism', label: '관광지', file: 'tourism.json' },
  { id: 'sports', label: '레포츠', file: 'sports.json' },
  { id: 'culture', label: '문화시설', file: 'culture.json' },
  { id: 'festival', label: '축제/공연/행사', file: 'festival.json' },
  { id: 'shopping', label: '쇼핑', file: 'shopping.json' },
]

const TOP_REGION_COUNT = 6

function loadItems(file) {
  const raw = readFileSync(join(dataDir, file), 'utf-8')
  return JSON.parse(raw).items || []
}

function extractGu(addr) {
  const match = /(\S+구)\s/.exec(addr || '')
  return match ? match[1] : null
}

const infoStats = []
const regionCounts = new Map()
let unresolvedCount = 0

for (const category of CATEGORIES) {
  const items = loadItems(category.file)
  infoStats.push({ id: category.id, label: category.label, count: items.length })

  for (const item of items) {
    const gu = extractGu(item.addr1)
    if (!gu) {
      unresolvedCount += 1
      continue
    }
    regionCounts.set(gu, (regionCounts.get(gu) || 0) + 1)
  }
}

const rankedRegions = [...regionCounts.entries()].sort((a, b) => b[1] - a[1])
const topRegions = rankedRegions.slice(0, TOP_REGION_COUNT)
const restRegions = rankedRegions.slice(TOP_REGION_COUNT)
const restCount =
  restRegions.reduce((sum, [, count]) => sum + count, 0) + unresolvedCount


const regionStats = topRegions.map(([label, count], index) => ({
  id: `region-${index + 1}`,
  label,
  count,
}))

if (restRegions.length > 0) {
  regionStats.push({
    id: 'etc',
    label: `기타 ${restRegions.length}개 구`,
    count: restCount,
  })
}

function writeStatsFile(fileName, exportName, data) {
  const banner =
    '// 이 파일은 자동 생성됩니다. 직접 수정하지 마세요.\n' +
    '// 원본 데이터가 바뀌면 `npm run generate:stats`를 다시 실행하세요.\n'
  const body = `export const ${exportName} = ${JSON.stringify(data, null, 2)}\n`
  writeFileSync(join(dataDir, fileName), banner + body)
  console.log(`wrote ${fileName} (${data.length} entries)`)
}

writeStatsFile('infoStats.js', 'INFO_STATS', infoStats)
writeStatsFile('regionStats.js', 'REGION_STATS', regionStats)
