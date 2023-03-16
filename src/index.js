import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import debounce from 'lodash.debounce';
import { fetchCountries } from './fetchCountries';

// Створи фронтенд частину програми пошуку даних про країну за її частковою або повною назвою.
// Використовуй публічний API Rest Countries v2, а саме ресурс name, який повертає масив об'єктів країн,
// що задовольнили критерій пошуку.Додай мінімальне оформлення елементів інтерфейсу.
// Напиши функцію fetchCountries(name), яка робить HTTP-запит на ресурс name і повертає проміс з масивом країн - результатом запиту.
// Винеси її в окремий файл fetchCountries.js і зроби іменований експорт.
// Фільтрація полів
// У відповіді від бекенду повертаються об'єкти, велика частина властивостей яких, тобі не знадобиться.
// Щоб скоротити обсяг переданих даних, додай рядок параметрів запиту - таким чином цей бекенд реалізує фільтрацію полів.
// Ознайомся з документацією синтаксису фільтрів.

// Тобі потрібні тільки наступні властивості:

// name.official - повна назва країни
// capital - столиця
// population - населення
// flags.svg - посилання на зображення прапора
// languages - масив мов

// Назву країни для пошуку користувач вводить у текстове поле input#search - box.HTTP - запити виконуються при введенні назви країни, тобто на події input.
// Але робити запит з кожним натисканням клавіші не можна, оскільки одночасно буде багато запитів і вони будуть виконуватися в непередбачуваному порядку.
// Необхідно застосувати прийом Debounce на обробнику події і робити HTTP - запит через 300мс після того, як користувач перестав вводити текст.
//  Використовуй пакет lodash.debounce.
// Якщо користувач повністю очищає поле пошуку, то HTTP-запит не виконується, а розмітка списку країн або інформації про країну зникає.
// Виконай санітизацію введеного рядка методом trim(), це вирішить проблему, коли в полі введення тільки пробіли, або вони є на початку і в кінці рядка.
// Якщо у відповіді бекенд повернув більше ніж 10 країн, в інтерфейсі з'являється повідомлення про те, що назва повинна бути специфічнішою.
//  Для повідомлень використовуй бібліотеку notiflix і виводь такий рядок "Too many matches found. Please enter a more specific name.".
// Якщо бекенд повернув від 2 - х до 10 - и країн, під тестовим полем відображається список знайдених країн.
// Кожен елемент списку складається з прапора та назви країни.
// Якщо результат запиту - це масив з однією країною, в інтерфейсі відображається розмітка картки з даними про країну: прапор, назва, столиця, населення і мови.
// Якщо користувач ввів назву країни, якої не існує, бекенд поверне не порожній масив, а помилку зі статус кодом 404 - не знайдено.
// Якщо це не обробити, то користувач ніколи не дізнається про те, що пошук не дав результатів.
// Додай повідомлення "Oops, there is no country with that name" у разі помилки, використовуючи бібліотеку notiflix.
// Не забувай про те, що fetch не вважає 404 помилкою, тому необхідно явно відхилити проміс, щоб можна було зловити і обробити помилку.

const countryInput = document.querySelector('#search-box');
const countryList = document.querySelector('.country-list');
const countryInfo = document.querySelector('.country-info');

const DEBOUNCE_DELAY = 300;

countryInput.addEventListener(
  'input',
  debounce(inputCountrySearch, DEBOUNCE_DELAY)
);

function inputCountrySearch(evt) {
  const onInputCountry = evt.target.value.trim();
  if (onInputCountry === '') {
    return;
  }

  fetchCountries(onInputCountry)
    .then(response => {
      if (response.length > 10) {
        Notify.info(
          'Too many matches found. Please enter a more specific name.'
        );
      }

      if (response.length >= 2 && response.length <= 10) {
        onSearchCountry(response);
      }

      if (response.length === 1) {
        searchListCountry(response);
      }
    })
    .catch(error => console.log(error));
  clearSearchCountry();
}

function onSearchCountry(response) {
  const markup = response
    .map(el => {
      return `<li class="item_country">
            <img class="img" src="${el.flags.svg}" width = 30 alt="flag">
            <h3 class="title">${el.name.official}</h3>
            </li>`;
    })
    .join('');
  countryList.innerHTML = markup;
}

function searchListCountry(response) {
  const markup = response
    .map(el => {
      return `<div class="item_country"><img class="img" src="${
        el.flags.svg
      }" width=50 alt="flag">
    <h1 class ="title">${el.name.official}</h1></div>
    <p class="text"><b>Capital:</b> ${el.capital}</p>
    <p class="text"><b>Population:</b> ${el.population}</p>
    <p class="text"><b>Languages:</b> ${Object.values(el.languages)}</p>`;
    })
    .join('');
  countryInfo.innerHTML = markup;
}

function clearSearchCountry() {
  countryList.innerHTML = '';
  countryInfo.innerHTML = '';
}
