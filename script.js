const imageFiles = [
  "1.png",
  "2สารบัญ.png",
  "3แนะนำโรงแรม.png",
  "4แนะนำโรงแรม.png",
  "5แนะนำโรงแรม.png",
  "6อาหารโรงแรม.png",
  "7อาหารโรงแรม.png",
  "8อาหารโรงแรม.png",
  "9อาหารโรงแรม.png",
  "10อาหารโรงแรม.png",
  "11อาหารโรงแรม.png",
  "12แนะนำสำรับอาหา.png",
  "13แนะนำสำรับอาหา.png",
  "14แนะนำสำรับอาหา.png",
  "15แนะนำสำรับอาหา.png",
  "16ของท้องถิ่น.png",
  "17ของท้องถิ่น.png",
  "18ของท้องถิ่น.png",
  "19ของท้องถิ่น.png",
  "20ของท้องถิ่น.png",
  "21ของท้องถิ่น.png",
  "22ของท้องถิ่น.png",
  "23ของท้องถิ่น.png",
  "24อาหารโรงแรม.png",
];

function getLeadingNumber(fileName) {
  const match = fileName.match(/^(\d+)/);
  return match ? Number.parseInt(match[1], 10) : Number.POSITIVE_INFINITY;
}

function toImageUrl(fileName) {
  return `img/${encodeURIComponent(fileName)}`;
}

const images = imageFiles
  .slice()
  .sort((a, b) => getLeadingNumber(a) - getLeadingNumber(b) || a.localeCompare(b, "th"))
  .map((fileName) => toImageUrl(fileName));

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
    pageIndicator.textContent = `pages ${currentPage} / ${images.length}`;
  } else {
    const leftPageNumber = currentIndex + 1;
    const rightPageNumber = leftPageNumber + 1;
    setImage(leftImage, leftPageNumber);
    setImage(rightImage, rightPageNumber);
    rightPage.classList.remove("is-empty");
    bookPages.classList.remove("single-mode");
    pageIndicator.textContent = `pages ${leftPageNumber}-${rightPageNumber} / ${images.length}`;
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
