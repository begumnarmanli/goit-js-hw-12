import 'izitoast/dist/css/iziToast.min.css';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { fetchImages } from './js/fetchImages.js';
import SimpleLightbox from 'simplelightbox';
import iziToast from 'izitoast';

const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const loadingMessage = document.querySelector('.loading-message');
const loadMoreBtn = document.querySelector('#load-more');
const lightbox = new SimpleLightbox('.gallery a');
const loadingMessageBottom = document.querySelector('#loading-message-bottom');

let currentPage = 1;
let currentQuery = '';
let remainingImages = [];
let totalHits = 0;

function renderImagesInBatches(images) {
  const fullGroupsCount = Math.floor(images.length / 3) * 3;
  const imagesToShow = images.slice(0, fullGroupsCount);

  const markup = imagesToShow
    .map(
      img => `
      <a href="${img.largeImageURL}" class="gallery-item">
        <img src="${img.webformatURL}" alt="${img.tags}" />
        <div class="info">
          <div class="info-block"><span class="info-title">Likes</span><span class="info-value">${img.likes}</span></div>
          <div class="info-block"><span class="info-title">Views</span><span class="info-value">${img.views}</span></div>
          <div class="info-block"><span class="info-title">Comments</span><span class="info-value">${img.comments}</span></div>
          <div class="info-block"><span class="info-title">Downloads</span><span class="info-value">${img.downloads}</span></div>
        </div>
      </a>
    `
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();

  return images.slice(fullGroupsCount);
}
function showLoadingBottom() {
  loadingMessageBottom.classList.remove('hidden');
}

function hideLoadingBottom() {
  loadingMessageBottom.classList.add('hidden');
}
function showLoadingMessage() {
  loadingMessage.classList.remove('hidden');
}

function hideLoadingMessage() {
  setTimeout(() => {
    loadingMessage.classList.add('hidden');
  }, 1000);
}

function showLoader() {
  loader.classList.remove('hidden');
}

function hideLoader() {
  loader.classList.add('hidden');
}

function showLoadMore() {
  loadMoreBtn.classList.add('visible');
}

function hideLoadMore() {
  loadMoreBtn.classList.remove('visible');
}

async function performSearch(query) {
  if (currentPage === 1) {
    gallery.innerHTML = '';
    remainingImages = [];
  }

  showLoader();
  showLoadingMessage();

  try {
    const data = await fetchImages(query, currentPage);
    hideLoader();
    hideLoadingMessage();

    if (data.hits.length === 0) {
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
        backgroundColor: '#EF4040',
      });
      hideLoadMore();
      return;
    }

    totalHits = data.totalHits;

    remainingImages = remainingImages.concat(data.hits);

    remainingImages = renderImagesInBatches(remainingImages);

    if (remainingImages.length === 0 && currentPage * 40 >= totalHits) {
      hideLoadMore();
      iziToast.info("You've reached the end of the search results.");
    } else {
      showLoadMore();
    }
  } catch (error) {
    hideLoader();
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong. Please try again later.',
      position: 'topRight',
    });
    console.error(error);
  }
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const query = e.target.searchQuery.value.trim();
  if (!query) return;

  currentQuery = query;
  currentPage = 1;

  performSearch(currentQuery);
  form.reset();
});

loadMoreBtn.addEventListener('click', async () => {
  hideLoadMore();
  showLoadingBottom();
  showLoader();

  await new Promise(resolve => setTimeout(resolve, 2000));

  currentPage += 1;
  try {
    await performSearch(currentQuery);

    const galleryItem = document.querySelector('.gallery-item');
    if (galleryItem) {
      const { height } = galleryItem.getBoundingClientRect();
      window.scrollBy({
        top: height * 2,
        behavior: 'smooth',
      });
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong. Please try again later.',
      position: 'topRight',
    });
  } finally {
    hideLoadingBottom();
    hideLoader();
    showLoadMore();
  }
});
