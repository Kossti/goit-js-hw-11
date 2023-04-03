import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '34786685-cbc85d9ed4d6781cc6b7aa9bf';

class ApiSearchImageService {
  #page = 1;
  #previousQuery = null;

  fetchData(searchQ) {
    this.#page = searchQ === this.#previousQuery ? this.#page + 1 : 1;
    this.#previousQuery = searchQ;

    const searchParams = new URLSearchParams({
      q: searchQ,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: this.#page,
      per_page: 40,
    });

    return fetch(`${BASE_URL}?key=${API_KEY}&${searchParams}`)
      .then(response => response.json())
      .then(({ hits }) => hits);
  }
}

export default new ApiSearchImageService();
