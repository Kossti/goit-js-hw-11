import notifier from './notifier';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { formToJSON } from 'axios';
import axios from 'axios';
import apiSearchImageService from './search-service-API';

class ImageBox {
  #targetElement = null;
  #infinityLoading = true;
  #refs = {};
  #searchForm = {};
  #buttonLoadMore = {};
  #searchQ = null;
  #galleryCards = {};
  #images = [];

  constructor({ targetElement, infinityLoading = false } = {}) {
    this.#targetElement = targetElement || document.body;
    this.#infinityLoading = infinityLoading;
  }

  init() {
    this.#initRefs();
    this.#initListeners();
    this.#toggleMoreButton();
    if (this.#infinityLoading) {
      this.#initInfinityLoading();
    }
  }
  #initRefs() {
    this.#searchForm = document.querySelector('.search-form');
    this.#galleryCards = document.querySelector('.gallery');
    this.#buttonLoadMore = document.querySelector('.load-more');
  }

  #initListeners() {
    this.#searchForm.addEventListener('submit', this.#onSearchForm.bind(this));
    this.#buttonLoadMore.addEventListener(
      'click',
      this.#onClickLoadMoreBtn.bind(this)
    );
  }

  #updateImages(images) {
    this.#images = images;
    this.#render();

    if (!this.#infinityLoading) {
      this.#toggleMoreButton();
    } else {
      this.#toggleMoreButton();
    }
  }

  async #onSearchForm(event) {
    event.preventDefault();
    this.#searchQ = event.currentTarget.elements.searchQuery.value;
    const images = await this.#fetchImages();

    if (images.length > 0) {
      this.#updateImages(images);
    } else {
      return notifier.error(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    event.target.reset();

    // =====
    // this.#fetchImages()
    //   .then(images => {
    //     if (images.length === 0) {
    //       return notifier.error(
    //         'Sorry, there are no images matching your search query. Please try again.'
    //       );
    //     }
    //     this.#updateImages(images);
    //   })
    //   .finally(() => {
    //     event.target.reset();
    //   });
    // this.#galleryCards.innerHTML = '';
  }

  async #fetchImages() {
    try {
      return await apiSearchImageService.fetchData(this.#searchQ);
    } catch (error) {
      console.error(error);
      notifier.error(
        "We're sorry, but you've reached the end of search results."
      );
    }
    // ======
    // return apiSearchImageService
    //   .fetchData(this.#searchQ)
    //   .then(images => images)
    //   .catch(error => {
    //     console.error(error);
    //     notifier.error(
    //       "We're sorry, but you've reached the end of search results."
    //     );
    //   });
  }

  async #loadMore() {
    const images = await this.#fetchImages();
    // this.#updateImages(images);
    this.#updateImages([...this.#images, ...images]);
    if (images.length === 0) {
      return notifier.error(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    // ====
    // return this.#fetchImages().then(images => {
    //   this.#updateImages([...this.#images, ...images]);
    // });
  }

  async #onClickLoadMoreBtn() {
    // this.#buttonLoadMore.classList.add('load-more__btn_loading');
    this.#buttonLoadMore.classList.add('load-more__btn_hidden');
    this.#buttonLoadMore.disabled = true;

    await this.#loadMore();
    this.#buttonLoadMore.classList.remove('load-more__btn_hidden');
    this.#buttonLoadMore.disabled = false;

    // ========
    // this.#loadMore().finally(() => {
    //   // this.#buttonLoadMore.classList.remove('load-more__btn_loading');
    //   this.#buttonLoadMore.classList.remove('load-more__btn_hidden');
    //   this.#buttonLoadMore.disabled = false;
    // });
  }

  #toggleMoreButton() {
    if (this.#images.length > 0) {
      this.#buttonLoadMore.classList.remove('load-more__btn_hidden');
    } else {
      this.#buttonLoadMore.classList.add('load-more__btn_hidden');
    }
  }

  #initInfinityLoading() {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting && this.#images.length > 0) {
            this.#loadMore();
          }
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(this.#buttonLoadMore);
  }

  #render() {
    const mockup = this.#images
      .map(
        ({
          webformatURL,
          largeImageURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        }) => {
          return `
             <div class="photo-card">
              <a class="photo-card-link" href="${largeImageURL}">
                  <img class="photo-card-img" src="${webformatURL}" alt="${tags}" loading="lazy"/>
              </a>
              <div class="info">
                <p class="info-item"><b>Likes</b>: ${likes}</p>
                <p class="info-item"><b>Views</b>: ${views}</p>
                <p class="info-item"><b>Comments</b>: ${comments}</p>
                <p class="info-item"><b>Downloads</b>: ${downloads}</p>
              </div>
            </div>
         `;
        }
      )
      .join('');
    // this.#galleryCards.insertAdjacentHTML('beforeend', mockup);
    this.#galleryCards.innerHTML = mockup;
    lightbox.refresh();
  }
}

// with infinity scroll:
// const imageBox = new ImageBox({ infinityLoading: true });
// with bitton load more:
const imageBox = new ImageBox();
imageBox.init();

var lightbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});
