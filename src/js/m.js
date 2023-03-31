const searchForm = document.querySelector('.search-form');

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  console.log(event.currentTarget.elements.searchQuery.value);
});
