<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <button class="nav-button" @click="goToPreviousMonth">←</button>
      <div class="current-month">{{ monthName }} {{ year }}</div>
      <button class="nav-button" @click="goToNextMonth">→</button>
    </div>
    <div class="weekdays">
      <div v-for="weekday in weekdays" :key="weekday" class="weekday">
        {{ weekday }}
      </div>
    </div>
    <div class="days-grid">
      <div
        v-for="(day, index) in daysOfCalendar"
        :key="index"
        class="day"
        :class="{
          'other-month': !day.isCurrentMonth,
          today: day.isToday,
          selected: day.isSelected,
        }"
        @click="handleDateSelection(day.date!)"
      >
        {{ day.date?.getDate() }}
      </div>
    </div>
    <div class="selected-date">
      {{ selectedDateFormatter }}
    </div>
    <div class="controls">
      <select
        class="language-select"
        v-model="currentLocale"
        @change="changeLanguage(currentLocale)"
      >
        <option value="en">English</option>
        <option value="ru">Русский</option>
      </select>
      <button class="today-button" @click="goToCurrentDate">
        {{ currentLocale === Locales.ru ? 'Текущая дата' : 'Current date' }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { languages } from './shared/languages'
import './shared/styles.css'
import { Locales, type Day } from './shared/types'

const currentDate = ref(new Date())
const selectedDate = ref<Date>(new Date())
const currentLocale = ref<Locales>(Locales.ru)
const initialDate = ref<Date>(new Date())

const createInitialDate = (initialDate: Date) => {
  const date: Date = new Date(initialDate)

  selectedDate.value = date
  currentDate.value = new Date(date)
}

const year = computed(() => currentDate.value.getFullYear())
const month = computed(() => currentDate.value.getMonth())

const monthDayCount = computed(() => {
  const result = new Date(year.value, month.value + 1, 0).getDate()
  return result
})

const monthFirstDay = computed(() => {
  const result = new Date(year.value, month.value, 1).getDay()
  return result
})

const monthName = computed(() => {
  return languages[currentLocale.value].months[month.value]
})

const weekdays = computed(() => {
  return languages[currentLocale.value].weekdays
})

const daysOfCalendar = computed(() => {
  const days: Day[] = []
  const previosMonthDaysCount = new Date(year.value, month.value, 0).getDate()

  /*
    Циклы for - наулучшее решение для генерации данных в массиве date.
    Array.from вряд ли даст преимущества, да и читать его сложнее.
  */

  for (let i = monthFirstDay.value - 1; i >= 0; i--) {
    const date = new Date(year.value, month.value - 1, previosMonthDaysCount - i)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: checkIsCurrentDate(date),
      isSelected: isSelected(date),
    })
  }

  for (let i = 1; i <= monthDayCount.value; i++) {
    const date = new Date(year.value, month.value, i)
    days.push({
      date,
      isCurrentMonth: true,
      isToday: checkIsCurrentDate(date),
      isSelected: isSelected(date),
    })
  }

  const calendarPageCellCount = 42
  const viewingMonthHighlightedDayCount = calendarPageCellCount - days.length

  for (let i = 1; i <= viewingMonthHighlightedDayCount; i++) {
    const date = new Date(year.value, month.value + 1, i)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: checkIsCurrentDate(date),
      isSelected: isSelected(date),
    })
  }

  return days
})

const selectedDateFormatter = computed(() => {
  return selectedDate.value.toLocaleDateString(currentLocale.value, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const checkIsCurrentDate = (date: Date) => {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

const isSelected = (date: Date) => {
  return (
    date.getDate() === selectedDate.value.getDate() &&
    date.getMonth() === selectedDate.value.getMonth() &&
    date.getFullYear() === selectedDate.value.getFullYear()
  )
}

const handleDateSelection = (day: Date) => {
  selectedDate.value = new Date(day)

  const event = new CustomEvent('date-selected', {
    detail: {
      date: `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`,
    },
  })
  document.dispatchEvent(event)
}

const goToPreviousMonth = () => {
  currentDate.value = new Date(year.value, month.value - 1, 1)
}

const goToNextMonth = () => {
  currentDate.value = new Date(year.value, month.value + 1, 1)
}

const goToCurrentDate = () => {
  currentDate.value = new Date()
  selectedDate.value = new Date()
}

const changeLanguage = (lang: Locales) => {
  currentLocale.value = lang
}

onMounted(() => {
  createInitialDate(initialDate.value)
})
</script>
