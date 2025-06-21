export function renderGallery(images) {
  return images
    .map(image => {
      return `
        <a class="photo-card" href="${image.largeImageURL}">
          <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
          <div class="info">
            <p><b>Likes:</b> ${image.likes}</p>
            <p><b>Views:</b> ${image.views}</p>
            <p><b>Comments:</b> ${image.comments}</p>
            <p><b>Downloads:</b> ${image.downloads}</p>
          </div>
        </a>
      `;
    })
    .join('');
}

export function clearGallery() {
  document.querySelector('.gallery').innerHTML = '';
}

export function appendImages(markup) {
  document.querySelector('.gallery').insertAdjacentHTML('beforeend', markup);
}
