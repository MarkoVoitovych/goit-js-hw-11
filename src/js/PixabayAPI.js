import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com';

export class PixabayAPI {
    #page = 1;
    #query = "";
    #totalPhotos = 0;
    #perPage = 1;
    #API_KEY = '31446956-3401e915dba4e7bdf39ba13d6';

    constructor({ perPage = 10 } = {}) {
        this.#perPage = perPage;
    }

    async getPhotos() {
        const params = new URLSearchParams({
            key: this.#API_KEY,
            q: this.#query,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: 'true',
            per_page: this.#perPage,
            page: this.#page,
        });
        const { data } = await axios.get('/api/', { params });
        return data;

    }
    get query() {
        return this.#query;
    }
    set query(newQuery) {
        this.#query = newQuery;
    }
    incrementPage() {
        this.#page += 1;
    }
    resetPage() {
        this.#page = 1;
    }
    setTotal(newTotal) {
        this.#totalPhotos = newTotal;
    }
    hasMorePhotos() {
        return this.#page < Math.ceil(this.#totalPhotos / this.#perPage);
    }
}