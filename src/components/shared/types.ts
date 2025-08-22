export enum Locales {
  ru = 'ru',
  en = 'en',
}

export type Day = {
  date?: Date
  isCurrentMonth?: boolean
  isToday?: boolean
  isSelected?: boolean
}
