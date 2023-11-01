//window.addEventListener("load", init);
let niceCatCount = 0;
let meanCatCount = 0;
let niceCatIsChosen = false;
let meanCatIsChosen = false;
let countHasIncreased = false;

function init() {
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
  if (niceCatIsChosen == false) {
    if (countHasIncreased == false) {
      niceCatCount++;
      countHasIncreased = true;
    } else {
      niceCatCount++;
      meanCatCount--;
    }
    console.log("mean:" + meanCatCount);
    console.log("nice:" +niceCatCount);
    let niceCat = document.getElementById("cat1");
    let meanCat = document.getElementById("cat2");
    niceCatIsChosen = true;
    meanCatIsChosen = false;
  }

}

function incrementMeanCatCount() {
  if (meanCatIsChosen == false) {
    if (countHasIncreased == false) {
      meanCatCount++;
      countHasIncreased = true;
    } else {
      meanCatCount++;
      niceCatCount--;
    }
    console.log("mean:" + meanCatCount);
    console.log("nice:" +niceCatCount);
    let niceCat = document.getElementById("cat1");
    let meanCat = document.getElementById("cat2");
    niceCatIsChosen = false;
    meanCatIsChosen = true;
  }
}

function calculateResults() {
  if (niceCatCount > meanCatCount) {
    return 0;
  } else {
    return 1;
  }
}

