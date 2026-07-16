import sports from './sports.json'
import culture from './culture.json'
import festival from './festival.json'
import shopping from './shopping.json'

export const INFO_CATEGORIES = [
  { id: 'sports', label: '레포츠', data: sports },
  { id: 'culture', label: '문화시설', data: culture },
  { id: 'festival', label: '축제/공연/행사', data: festival },
  { id: 'shopping', label: '쇼핑', data: shopping },
]

export function getInfoCategory(categoryId) {
  return INFO_CATEGORIES.find(category => category.id === categoryId)
}
