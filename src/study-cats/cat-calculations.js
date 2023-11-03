let niceCatCount = 0;
let meanCatCount = 0;
let progress = 0;
let niceCatIsChosen = false;
let meanCatIsChosen = false;
let countHasIncreased = false;
let niceCatsArray = ["img/stim-img/cat1.jpg", "img/stim-img/cat4.jpg", "img/stim-img/cat6.jpg", "img/stim-img/cat8.jpg", "img/stim-img/cat10.jpg"];
let meanCatsArray = ["img/stim-img/cat2.jpg", "img/stim-img/cat3.jpg", "img/stim-img/cat5.jpg", "img/stim-img/cat7.jpg", "img/stim-img/cat9.jpg"];

function initPractice() {
  let niceCat = document.getElementById("cat1");
  let meanCat = document.getElementById("cat2");
  niceCat.addEventListener("click", incrementNiceCatCount);
  meanCat.addEventListener("click", incrementMeanCatCount);
  document.onkeydown = function(e) {
    if (e.keyCode === 49) {
      incrementNiceCatCount();
    } else if(e.keyCode == 50) {
      incrementMeanCatCount();
    }
  }
}

function initTrial() {
  niceCatCount = 0;
  meanCatCount = 0;
  progress = 0;
  chooseRandomCatImages();
  let niceCat = document.getElementById("cat1");
  let meanCat = document.getElementById("cat2");
  niceCat.addEventListener("click", incrementNiceCatCount);
  meanCat.addEventListener("click", incrementMeanCatCount);
  document.onkeydown = function(e) {
    if (e.keyCode === 49) {
      incrementNiceCatCount();
    } else if(e.keyCode == 50) {
      incrementMeanCatCount();
    }
  }
}

function incrementNiceCatCount() {
  niceCatCount++;
  console.log("mean:" + meanCatCount);
  console.log("nice:" +niceCatCount);
  console.log("progress:" + progress);
  let container = document.getElementById("cat-container");
  let niceCat = document.getElementById("cat1");
  let meanCat = document.getElementById("cat2");
  container.removeChild(niceCat);
  container.removeChild(meanCat);
  chooseRandomCatImages();
}

function incrementMeanCatCount() {
  meanCatCount++;
  console.log("mean:" + meanCatCount);
  console.log("nice:" +niceCatCount);
  console.log("progress:" + progress);
  let container = document.getElementById("cat-container");
  let niceCat = document.getElementById("cat1");
  let meanCat = document.getElementById("cat2");
  container.removeChild(niceCat);
  container.removeChild(meanCat);
  chooseRandomCatImages();
}

function checkProgress() {
  progress++;
  if (progress >= 10) {
    let niceCat = document.getElementById("cat1");
    let meanCat = document.getElementById("cat2");
    niceCat.removeEventListener("click", incrementNiceCatCount);
    meanCat.removeEventListener("click", incrementMeanCatCount);
    $('#btn-next-page').attr('style', 'display:block;');
    $('#btn-next-page')[0].scrollIntoView();
  }
}

function chooseRandomCatImages() {
  setNiceCatImage();
  setMeanCatImage();
  checkProgress();
}

function selectRandomNiceCat() {
  let randomNum = Math.floor(Math.random() * 5);
  return niceCatsArray[randomNum];
}

function selectRandomMeanCat() {
  let randomNum = Math.floor(Math.random() * 5);
  return meanCatsArray[randomNum];
}

function setNiceCatImage() {
  let container = document.getElementById("cat-container");
  let image = document.createElement("img");
  image.setAttribute("id", "cat1");
  image.src = selectRandomNiceCat();
  image.alt = "a nice cat";
  image.addEventListener("click", incrementNiceCatCount);
  container.appendChild(image);
}

function setMeanCatImage() {
  let container = document.getElementById("cat-container");
  let image = document.createElement("img");
  image.setAttribute("id", "cat2");
  image.src = selectRandomMeanCat();
  image.alt = "a mean cat";
  image.addEventListener("click", incrementMeanCatCount);
  container.appendChild(image);
}

function calculateResults() {
  if (niceCatCount > meanCatCount) {
    return selectRandomNiceCat();
  } else {
    return selectRandomMeanCat();
  }
}

