import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

import { refs } from "./refs";
import { renderMarkup } from './renderMarkup';
import { PixabayAPI } from './PixabayAPI';

const pixabayAPI = new PixabayAPI();

refs.searchForm.addEventListener('submit', onSearchFormSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);

async function onSearchFormSubmit(event) {
    event.preventDefault();
    refs.gallery.innerHTML = "";
    const inputValue = event.target.elements.searchQuery.value.trim();
    if (!inputValue) {
        return "";
    }
    event.target.reset();
    try {
        pixabayAPI.query = inputValue;
        const data = await pixabayAPI.getPhotos();
        if (data.hits.length === 0) {
            Notify.failure(
                'Sorry, there are no images matching your search query. Please try again.'
            );
            event.target.reset();
            return '';
        }
        const markup = [...(data.hits)].map(renderMarkup).join('');
        refs.gallery.innerHTML = markup;
        Notify.success(`Hooray! We found ${data.totalHits} images.`);
        pixabayAPI.setTotal(data.totalHits);
        if (pixabayAPI.hasMorePhotos()) {
            refs.loadMoreBtn.classList.remove('is-hidden');
        }
    }
    catch (error) {
        Notify.failure(
            'Sorry, there are no images matching your search query. Please try again.'
        );
    }
}

async function onLoadMoreBtnClick(event) {
    pixabayAPI.incrementPage();
    const data = await pixabayAPI.getPhotos();
    const markup = [...(data.hits)].map(renderMarkup).join('');
    refs.gallery.insertAdjacentHTML('beforeend', markup);

    if (!pixabayAPI.hasMorePhotos()) {
        refs.loadMoreBtn.classList.add('is-hidden');
    }
}