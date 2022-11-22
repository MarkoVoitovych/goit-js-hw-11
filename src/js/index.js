import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

import { refs } from "./refs";
import { renderMarkup } from './renderMarkup';
import { PixabayAPI } from './PixabayAPI';

const pixabayAPI = new PixabayAPI();
const lightbox = new SimpleLightbox('.gallery a');
const intersectionObserver = new IntersectionObserver(onEntry, {
    root: null,
    rootMargin: '150px',
    threshold: 1.0,
});

refs.searchForm.addEventListener('submit', onSearchFormSubmit);
// refs.loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);

async function onSearchFormSubmit(event) {
    event.preventDefault();
    refs.gallery.innerHTML = "";

    const inputValue = event.target.elements.searchQuery.value.trim();
    if (!inputValue) {
        // refs.loadMoreBtn.classList.add('is-hidden');
        return "";
    }
    event.target.reset();

    try {
        pixabayAPI.resetPage();
        pixabayAPI.query = inputValue;

        const data = await pixabayAPI.getPhotos();

        if (data.hits.length === 0) {
            Notify.failure(
                'Sorry, there are no images matching your search query. Please try again.'
            );
            event.target.reset();
            return '';
        }

        Notify.success(`Hooray! We found ${data.totalHits} images.`);

        const markup = [...(data.hits)].map(renderMarkup).join('');
        refs.gallery.innerHTML = markup;

        lightbox.refresh();

        pixabayAPI.setTotal(data.totalHits);
        if (pixabayAPI.hasMorePhotos()) {
            // refs.loadMoreBtn.classList.remove('is-hidden');
            intersectionObserver.observe(document.querySelector('.photo-card:last-child'));
        }
    }
    catch (error) {
        Notify.failure(
            'Sorry, there are no images matching your search query. Please try again.'
        );
    }
}

// async function onLoadMoreBtnClick(event) {
//     pixabayAPI.incrementPage();
//     const data = await pixabayAPI.getPhotos();
//     const markup = [...(data.hits)].map(renderMarkup).join('');
//     refs.gallery.insertAdjacentHTML('beforeend', markup);

//     smoothScroll();
//     lightbox.refresh();

//     if (!pixabayAPI.hasMorePhotos()) {
//         refs.loadMoreBtn.classList.add('is-hidden');
//         Notify.info('We\'re sorry, but you\'ve reached the end of search results.');
//     }
// }

function onEntry(entries, observer) {
    entries.forEach(async entry => {
        if (!pixabayAPI.hasMorePhotos()) {
            Notify.info('We\'re sorry, but you\'ve reached the end of search results.');
            return '';
        }

        if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            pixabayAPI.incrementPage();
            try {
                const data = await pixabayAPI.getPhotos();
                const markup = [...(data.hits)].map(renderMarkup).join('');
                refs.gallery.insertAdjacentHTML('beforeend', markup);

                lightbox.refresh();

                observer.observe(document.querySelector('.photo-card:last-child'));
            }
            catch (error) {
                observer.unobserve(entry.target);
                Notify.failure(error.message);
            }
        }
    });
}