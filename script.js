const images = Array.from({ length: 12 }, (_, index) => `img/${index + 1}.png`);

const bookPages = document.getElementById("bookPages");
const leftPage = document.getElementById("leftPage");
const rightPage = document.getElementById("rightPage");
const leftImage = document.getElementById("leftImage");
const rightImage = document.getElementById("rightImage");
const pageIndicator = document.getElementById("pageIndicator");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const mobileMedia = window.matchMedia("(max-width: 640px)");
const TRANSITION_DURATION = 240;
const SWIPE_THRESHOLD = 40;
let currentIndex = 0;
let isTransitioning = false;
let touchStartX = 0;
let touchStartY = 0;

function isMobileMode() {
  return mobileMedia.matches;
}

function getStep() {
  return isMobileMode() ? 1 : 2;
}

function normalizeIndex(index) {
  if (isMobileMode()) {
    return Math.max(0, Math.min(index, images.length - 1));
  }

  const spreadIndex = Math.floor(index / 2) * 2;
  const maxSpreadStart = Math.max(0, images.length - 2);
  return Math.max(0, Math.min(spreadIndex, maxSpreadStart));
}

function setImage(imageElement, pageNumber) {
  imageElement.src = images[pageNumber - 1];
  imageElement.alt = `ภาพหน้า ${pageNumber}`;
}

function updateControls() {
  const step = getStep();
  prevBtn.disabled = isTransitioning || currentIndex === 0;
  nextBtn.disabled = isTransitioning || currentIndex + step >= images.length;
}

function updatePage() {
  const mobileMode = isMobileMode();
  currentIndex = normalizeIndex(currentIndex);

  if (mobileMode) {
    const currentPage = currentIndex + 1;
    setImage(leftImage, currentPage);
    rightPage.classList.add("is-empty");
    bookPages.classList.add("single-mode");
    pageIndicator.textContent = `หน้า ${currentPage} / ${images.length}`;
  } else {
    const leftPageNumber = currentIndex + 1;
    const rightPageNumber = leftPageNumber + 1;
    setImage(leftImage, leftPageNumber);
    setImage(rightImage, rightPageNumber);
    rightPage.classList.remove("is-empty");
    bookPages.classList.remove("single-mode");
    pageIndicator.textContent = `หน้า ${leftPageNumber}-${rightPageNumber} / ${images.length}`;
  }

  updateControls();
}

function changePage(direction) {
  if (isTransitioning) {
    return;
  }

  const step = getStep();
  const nextIndex = currentIndex + step * direction;
  if (nextIndex < 0 || nextIndex >= images.length) {
    return;
  }

  isTransitioning = true;
  updateControls();
  bookPages.classList.add("is-transitioning");

  window.setTimeout(() => {
    currentIndex = nextIndex;
    updatePage();

    window.requestAnimationFrame(() => {
      bookPages.classList.remove("is-transitioning");
    });

    window.setTimeout(() => {
      isTransitioning = false;
      updateControls();
    }, TRANSITION_DURATION);
  }, TRANSITION_DURATION);
}

function handleSwipe(deltaX, deltaY) {
  if (!isMobileMode()) {
    return;
  }

  if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaY) > Math.abs(deltaX)) {
    return;
  }

  if (deltaX < 0) {
    changePage(1);
  } else {
    changePage(-1);
  }
}

prevBtn.addEventListener("click", () => {
  changePage(-1);
});

nextBtn.addEventListener("click", () => {
  changePage(1);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    prevBtn.click();
  }
  if (event.key === "ArrowRight") {
    nextBtn.click();
  }
});

mobileMedia.addEventListener("change", () => {
  currentIndex = normalizeIndex(currentIndex);
  updatePage();
});

bookPages.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  },
  { passive: true }
);

bookPages.addEventListener(
  "touchend",
  (event) => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    handleSwipe(deltaX, deltaY);
  },
  { passive: true }
);

updatePage();
