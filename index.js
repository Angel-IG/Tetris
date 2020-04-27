var slider = document.getElementById("slider");
let levelP = document.getElementById("LevelP");
levelP.innerHTML = "Use the bar below to select difficulty level. Current level: " + slider.value;

slider.oninput = function() {
  levelP.innerHTML = "Use the bar below to select difficulty level. Current level: " + this.value;
}

document.getElementById("play").addEventListener("click", function() {
  window.location.href = "game.html?level=" + slider.value;
});
