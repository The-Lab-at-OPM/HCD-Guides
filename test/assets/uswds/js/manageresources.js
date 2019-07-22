//TODO dynamic hiding of filters


//TODO: Change to support multiple filters at once
function setActiveTag(tag) {
  // loop through all items and remove active class
  var filters = document.getElementsByClassName('filter-checkbox');
  let filterNames = document.getElementsByClassName("filter-checkbox-label");

  for(var i=0; i < filters.length; i++) {
    filters[i].checked = false;
  }
  for(var i=0; i < filters.length; i++) {
    if(tag.includes(filterNames[i].innerHTML)){
    }
  }
  // set the selected tag's item to active
}


function generateMaster(){
  var lists = document.getElementById('method-results');
  var results = lists.getElementsByTagName("a");
  var filteredMethods = [];
  for(var i=0; i<results.length; i++){
    const style = getComputedStyle(results[i])
    if(style.display == 'inline-block' ||   results[i].style.display == 'inline-block'){
      filteredMethods.push(results[i].getAttribute("href"));
    }
  }

  var destination = document.getElementById("destination")
  fetch("/matrix").then(function(response){
    return response.text();
  }).then(function(text){
      let cleanText = sanitizeFetch(text);
      destination.textContent = cleanText[1] + cleanText[0];
    })
}

function sanitizeFetch(string){
  let methodMetadata = [];

  let descRegex = /<p\s*class\s*=\s*"description"\s*>([^>]+?)<\/p>/g
  let description = descRegex.exec(string)
  let noFrontTag = description.replace(/<p[^>]*>/,"");
  let withoutTags = noFrontTag.replace(/<\/p\s*>/,"");
  methodMetadata.push(description[0]);

  let titleRegex = /<h1\s*class\s*=\s*"site-page-title"\s*>([^>]+?)<\/h1>/g
  let title = titleRegex.exec(string).map(function(string){
    return string.replace(/<h1[^>]*>/,"").replace(/<\/h1\s*>/,"");
  });
  methodMetadata.push(title[0]);

  let imgRegex = /<img\s*class\s*=\s*"example"\s*>([^>]+?)<\/img>/g;


  return methodMetadata;
}

function showContainer(tags) {
  // loop through all lists and hide them
  var lists = document.getElementById('method-results');
  var results = lists.getElementsByTagName("a");
  var arrayOfTags = tags.split(" ");

  if(tags.length == 0){
      for(var i=0; i < results.length; i++) {
        results[i].style.display = 'inline-block';
        results[i].style.visibility = 'visible';

  }
}
  else{
    //loop through and hide all methods
    for(var i=0; i < results.length; i++) {
      results[i].style.display = 'none';
      results[i].style.visibility = 'hidden';
    }

    //unhide methods based on selected filter(s)
    for(var i=0; i < results.length; i++) {
      var counter = 0;
      for(var j=0; j<arrayOfTags.length;j++)
        if(results[i].className.includes(arrayOfTags[j])){
          counter ++;
        }

      if(counter == arrayOfTags.length){
          results[i].style.display = 'inline-block';
          results[i].style.visibility = 'visible';
        }
      else{
          results[i].style.display = 'none';
          results[i].style.visibility = 'hidden';
        }
      }

  }

  }

  function bindListeners(){
    let filters = document.getElementsByClassName("filter-checkbox");
    for(let i=0; i<filters.length ; i++){
      filters[i].addEventListener("click",filterTemplates,false);
    }

    let tags
    let generate = document.getElementById("generate")
    if(generate != null){
      generate.addEventListener("click",generateMaster,false)
    }
  }

function checkFromLocalStore(){
  let filters = document.getElementsByClassName("filter-checkbox");
  let filterNames = document.getElementsByClassName("filter-checkbox-label");

  for(var i=0; i < filters.length; i++) {
    let isChecked = localStorage.getItem(filterNames[i].innerHTML);
    if(isChecked == "true"){
      filters[i].checked = true;
    }
  }
}
function prepLocalStore(){
  alert("Prepping Local Store");
  let filters = document.getElementsByClassName("filter-checkbox");
  let filterNames = document.getElementsByClassName("filter-checkbox-label");
  for(var i = 0; i < filters.length; i++){
    localStorage.setItem(filterNames[i].innerHTML, "false");
  }
}
  function filterTemplates(){
    let filters = document.getElementsByClassName("filter-checkbox");
    let filterNames = document.getElementsByClassName("filter-checkbox-label");

    let checkedFilters = "" ;
    for(var i = 0; i < filters.length; i++){
        if(filters[i].checked == true){
          checkedFilters = checkedFilters +' '+ filterNames[i].innerHTML;
          localStorage.setItem(filterNames[i].innerHTML,"true");
          console.log(localStorage.getItem("Project Manager"));
        }
        else{
          localStorage.setItem(filterNames[i].innerHTML,"false");
          console.log(localStorage.getItem("Project Manager"));

        }

    }
    // setActiveTag(checkedFilters);
    showContainer(checkedFilters);
  }

var navbar, sticky;

function stickyNav() {

      // Add the sticky class to the navbar when you reach its scroll position. Remove "sticky" when you leave the scroll position
      if (window.pageYOffset > sticky) {
        navbar.classList.add("sticky")
      } else {
        navbar.classList.remove("sticky");
      }
  }

document.addEventListener("DOMContentLoaded",function(){
  bindListeners();
  window.addEventListener("scroll",stickyNav);
  navbar = document.querySelector("#navbar");
  banner = document.getElementsByClassName("usa-banner")[0];
  sticky = navbar.offsetTop - banner.offsetHeight;

  if (typeof(Storage) !== "undefined") {
    if(localStorage.getItem("setBefore") == null){
      localStorage.setItem("setBefore", "true");
      prepLocalStore();
    }
    else{
      //handle checking of filters based on previous entries
      console.log( "From Dom " + localStorage.getItem("Project Manager"));
      checkFromLocalStore();
    }
  } else {
    // TODO Write code for things that can't handle localStorage
  }


}, false);
