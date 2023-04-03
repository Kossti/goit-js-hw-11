import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { formToJSON } from 'axios';
import axios from 'axios';
import apiSearchImageService from './search-service-API';
import { Loading } from 'notiflix';

class ImageBox {
  #targetElement = null;
  #infinityLoading = true;
  #refs = {};
  #searchForm = {};
  #buttonLoadMore = {};
  #searchQ = null;
  #galleryCards = {};
  #images = [];
  #totalHits = [];
  // #hits = [];

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

    if (!this.#loadMore) {
      this.#toggleMoreButton();
    }

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
      return Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    event.target.reset();
  }

  async #fetchImages() {
    try {
      return await apiSearchImageService.fetchData(this.#searchQ);
    } catch (error) {
      console.error(error);
      Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
  }

  // #ifNotFoundConten() {
  //   if (images.length < 40) {
  //     this.#offLoadMore();
  //   } else {
  //     // this.#loadMore();
  //   }
  // }

  // #offLoadMore() {
  //   this.#buttonLoadMore.classList.add('load-more__btn_hidden');
  //   this.#buttonLoadMore.disabled = true;
  //   return Notify.info(
  //     "We're sorry, but you've reached the end of search results."
  //   );
  // }

  async #loadMore() {
    const images = await this.#fetchImages();
    this.#updateImages([...this.#images, ...images]);

    // const totalHits = await this.data.totalHits;

    if (images.length === 0) {
      this.#buttonLoadMore.classList.add('load-more__btn_hidden');
      this.#buttonLoadMore.disabled = true;
      return Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }

    // function onLoadMore() {
    // try {
    //   apiSearchImageService.fetchData().then(({ hits, total, totalHits }) => {
    //     let totalPages = Math.ceil(totalHits / apiSearchImageService.per_page);

    //     console.log(apiSearchImageService.page);
    //     console.log(totalPages);
    //     if (totalPages <= apiSearchImageService.page) {
    //       buttonLoadMore.classList.add('load-more__btn_hidden');
    //       Notify.Report.info(
    //         'Were sorry, but youve reached the end of search results.'
    //       );
    //     }
    //   });
    // } catch (error) {
    //   Notify.failure('Something went wrong. Please try again later.');
    // }
    // }
  }

  async #onClickLoadMoreBtn() {
    this.#buttonLoadMore.classList.add('load-more__btn_hidden');
    this.#buttonLoadMore.disabled = true;

    await this.#loadMore();
    this.#buttonLoadMore.classList.remove('load-more__btn_hidden');
    this.#buttonLoadMore.disabled = false;
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
// with bittom load more:
const imageBox = new ImageBox();
imageBox.init();

var lightbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});
