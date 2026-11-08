<script setup lang="ts">
import { ref, computed } from 'vue';
import type { User } from '@/types/user.ts';
import rawUsers from '@/data/users.json';

// Стан вихідного масиву
const users = ref<User[]>(rawUsers as User[]);

// Стан видимості деталей для кожної картки (id користувача -> boolean)
const expandedDetails = ref<Record<number, boolean>>({});

const toggleDetails = (userId: number): void => {
  expandedDetails.value[userId] = !expandedDetails.value[userId];
};

// Стан фільтрів і сортування
type GenderFilter = 'all' | 'male' | 'female';
type AgeFilter = 'all' | 'adult';
type SortField = 'none' | 'name-asc' | 'name-desc' | 'age-asc' | 'age-desc';

const selectedGender = ref<GenderFilter>('all');
const selectedAge = ref<AgeFilter>('all');
const currentSort = ref<SortField>('none');

// Очищення та скидання фільтрів
const resetFilters = (): void => {
  selectedGender.value = 'all';
  selectedAge.value = 'all';
  currentSort.value = 'none';
};

// Обчислюваний список із застосуванням фільтрів та сортування
const processedUsers = computed(() => {
  let list = [...users.value];

  // 1. Фільтрація за статтю
  if (selectedGender.value !== 'all') {
    list = list.filter((u) => u.gender === selectedGender.value);
  }

  // 2. Фільтрація за віком (18+)
  if (selectedAge.value === 'adult') {
    list = list.filter((u) => u.dob.age >= 18);
  }

  // 3. Сортування
  if (currentSort.value === 'name-asc') {
    list.sort((a, b) => a.name.first.localeCompare(b.name.first, 'uk'));
  } else if (currentSort.value === 'name-desc') {
    list.sort((a, b) => b.name.first.localeCompare(a.name.first, 'uk'));
  } else if (currentSort.value === 'age-asc') {
    list.sort((a, b) => a.dob.age - b.dob.age);
  } else if (currentSort.value === 'age-desc') {
    list.sort((a, b) => b.dob.age - a.dob.age);
  }

  return list;
});

// Функція для визначення вікової категорії (:class)
const getAgeCategoryClass = (age: number) => {
  return {
    minor: age < 18,
    young: age >= 18 && age <= 30,
    adult: age >= 31 && age <= 50,
    senior: age > 50,
  };
};
</script>

<template>
  <section class="users-container">
    <!-- Toolbar керування -->
    <header class="toolbar">
      <div class="filter-group">
        <span class="group-title">Стать:</span>
        <button
            :class="{ active: selectedGender === 'all' }"
            @click="selectedGender = 'all'"
        >
          Всі
        </button>
        <button
            :class="{ active: selectedGender === 'male' }"
            @click="selectedGender = 'male'"
        >
          Чоловіки
        </button>
        <button
            :class="{ active: selectedGender === 'female' }"
            @click="selectedGender = 'female'"
        >
          Жінки
        </button>
      </div>

      <div class="filter-group">
        <span class="group-title">Вік:</span>
        <button
            :class="{ active: selectedAge === 'all' }"
            @click="selectedAge = 'all'"
        >
          Всі
        </button>
        <button
            :class="{ active: selectedAge === 'adult' }"
            @click="selectedAge = 'adult'"
        >
          18+
        </button>
      </div>

      <div class="filter-group">
        <span class="group-title">Сортування:</span>
        <button
            :class="{ active: currentSort === 'name-asc' }"
            @click="currentSort = 'name-asc'"
        >
          Ім'я (А-Я)
        </button>
        <button
            :class="{ active: currentSort === 'name-desc' }"
            @click="currentSort = 'name-desc'"
        >
          Ім'я (Я-А)
        </button>
        <button
            :class="{ active: currentSort === 'age-asc' }"
            @click="currentSort = 'age-asc'"
        >
          Вік (&uarr;)
        </button>
        <button
            :class="{ active: currentSort === 'age-desc' }"
            @click="currentSort = 'age-desc'"
        >
          Вік (&darr;)
        </button>
      </div>

      <div class="filter-group">
        <button class="btn-reset" @click="resetFilters">
          Очистити все
        </button>
      </div>
    </header>

    <!-- Повідомлення про порожній список -->
    <div v-if="processedUsers.length === 0" class="empty-state">
      <p>Список юзерів пустий</p>
    </div>

    <!-- Список карток користувачів -->
    <div v-else class="cards-grid">
      <article
          v-for="user in processedUsers"
          :key="user.id"
          class="user-card"
          :class="getAgeCategoryClass(user.dob.age)"
      >
        <div class="avatar-wrapper">
          <img
              :src="user.picture"
              :alt="`${user.name.first} ${user.name.last}`"
              class="user-avatar"
          />
        </div>

        <div class="card-content">
          <h3>{{ user.name.first }} {{ user.name.last }}</h3>
          <p class="user-meta"><strong>Стать:</strong> {{ user.gender === 'male' ? 'Чоловік' : 'Жінка' }}</p>
          <p class="user-meta"><strong>Локація:</strong> {{ user.location.city }}, {{ user.location.country }}</p>
          <p class="user-meta"><strong>Email:</strong> {{ user.email }}</p>
          <p class="user-meta"><strong>Телефон:</strong> {{ user.phone }}</p>

          <!-- v-if: Вік показується лише якщо він більше 18 -->
          <p v-if="user.dob.age > 18" class="user-age">
            <strong>Вік:</strong> {{ user.dob.age }} років
          </p>

          <!-- Список хобі через v-for -->
          <div class="hobbies-section">
            <strong>Хобі:</strong>
            <ul class="hobbies-list">
              <li v-for="(hobby, idx) in user.hobbies" :key="idx">
                {{ hobby }}
              </li>
            </ul>
          </div>

          <!-- Кнопка розгортання та блок v-show -->
          <div class="details-section">
            <button class="btn-details" @click="toggleDetails(user.id)">
              {{ expandedDetails[user.id] ? 'Приховати деталі' : 'Показати деталі' }}
            </button>
            <p v-show="expandedDetails[user.id]" class="user-details-text">
              {{ user.details }}
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.users-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: Arial, sans-serif;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.group-title {
  font-weight: bold;
  font-size: 0.9rem;
}

button {
  padding: 0.4rem 0.8rem;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

button:hover {
  background-color: #e2e8f0;
}

button.active {
  background-color: #2563eb;
  color: #ffffff;
  border-color: #1d4ed8;
}

.btn-reset {
  background-color: #ef4444;
  color: #ffffff;
  border-color: #dc2626;
}

.btn-reset:hover {
  background-color: #dc2626;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.user-card {
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
}

/* Колірна диференціація за віком */
.user-card.minor {
  background-color: #eff6ff; /* Світло-блакитний */
  border-color: #93c5fd;
}

.user-card.young {
  background-color: #f0fdf4; /* Світло-зелений */
  border-color: #86efac;
}

.user-card.adult {
  background-color: #fefce8; /* Світло-жовтий */
  border-color: #fde047;
}

.user-card.senior {
  background-color: #fdf2f8; /* Світло-рожевий */
  border-color: #f472b6;
}

.avatar-wrapper {
  text-align: center;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-content h3 {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
}

.user-meta, .user-age {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #334155;
}

.hobbies-section {
  margin: 0.75rem 0;
}

.hobbies-list {
  margin: 0.25rem 0;
  padding-left: 1.25rem;
  font-size: 0.85rem;
  color: #475569;
}

.details-section {
  margin-top: auto;
  padding-top: 0.5rem;
}

.btn-details {
  width: 100%;
  background-color: #f1f5f9;
}

.user-details-text {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #475569;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 0.5rem;
  border-radius: 4px;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  font-size: 1.25rem;
  color: #64748b;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
}
</style>