/**
 * The cat study's own behaviour: practice, the ten trials, and the results
 * picture. Plain DOM — the study loads no libraries, so nothing here may rely
 * on one.
 */

const TRIALS = 10;

const NICE_CATS = ['img/cat1.jpg', 'img/cat4.jpg', 'img/cat6.jpg', 'img/cat8.jpg', 'img/cat10.jpg'];
const MEAN_CATS = ['img/cat2.jpg', 'img/cat3.jpg', 'img/cat5.jpg', 'img/cat7.jpg', 'img/cat9.jpg'];

let niceCount = 0;
let meanCount = 0;
let progress = 0;

function pick(images) {
  return images[Math.floor(Math.random() * images.length)];
}

function catImage(id, source, alt, onClick) {
  const image = document.createElement('img');
  image.id = id;
  image.src = source;
  image.alt = alt;
  if (onClick) image.addEventListener('click', onClick);
  return image;
}

function showNext() {
  const next = document.getElementById('btn-next-page');
  if (!next) return;
  next.style.display = 'block';
  next.scrollIntoView();
}

function dealPair() {
  const container = document.getElementById('cat-container');
  if (!container) return;
  container.replaceChildren(
    catImage('cat1', pick(NICE_CATS), 'a nice cat', () => choose('nice')),
    catImage('cat2', pick(MEAN_CATS), 'a mean cat', () => choose('mean')),
  );
}

function choose(kind) {
  if (kind === 'nice') niceCount += 1;
  else meanCount += 1;
  progress += 1;

  if (progress >= TRIALS) {
    document.onkeydown = null;
    showNext();
    return;
  }

  const counter = document.getElementById('counter');
  if (counter) counter.textContent = `${progress + 1}/${TRIALS}`;
  dealPair();
}

export function initPractice() {
  const finish = () => {
    showNext();
    document.onkeydown = null;
  };

  document.getElementById('cat1')?.addEventListener('click', finish);
  document.getElementById('cat2')?.addEventListener('click', finish);
  document.onkeydown = (event) => {
    if (event.key === '1' || event.key === '2') finish();
  };
}

export function initTrial() {
  niceCount = 0;
  meanCount = 0;
  progress = 0;

  const counter = document.getElementById('counter');
  if (counter) counter.textContent = `1/${TRIALS}`;
  dealPair();

  document.onkeydown = (event) => {
    if (event.key === '1') choose('nice');
    else if (event.key === '2') choose('mean');
  };
}

export function showResultsDetail() {
  const container = document.getElementById('cat-container');
  if (!container) return;

  const favourite = niceCount > meanCount ? NICE_CATS : MEAN_CATS;
  container.replaceChildren(catImage('cat-result', pick(favourite), 'a cat like the ones you chose'));
}
