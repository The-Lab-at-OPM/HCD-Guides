//TODO dynamic hiding of filters

/*
Updates the links in the sidebar nav according to which one is currently seleted
*/
function setActiveTag(tag) {
}

/*
Takes filtered methods and populates them into section methods reference books
*/
function generateMaster(){
  var lists = document.getElementById('method-results');
//removes all methods from localStorage
  if(lists !=null){
    var results = lists.getElementsByTagName("div");
    var allMethods = []
    for(var i=0; i<results.length; i++){
        let nameOfMethod = results[i].id;
        localStorage.removeItem(nameOfMethod)
    }
//gathers methods that are selected by filtering
    var filteredMethods = [];
    var links = lists.getElementsByTagName("a");
    for(var i=0; i<links.length; i++){
      const style = getComputedStyle(links[i])
      if(style.display == 'inline-block' ||   links[i].style.display == 'inline-block'){
        filteredMethods.push(links[i].getAttribute("href"));
      }
    }
//populates selected methods into appropriate methods reference section
  for(var i=0;i<filteredMethods.length;i++){
    let curMethod = filteredMethods[i].slice(1);

    fetch(filteredMethods[i]).then(function(response){
      return response.text();
    }).then(function(info){
      let cleanedText = sanitizeFetch(info);
      let arrayString =JSON.stringify(cleanedText);
      localStorage.setItem(cleanedText[1], arrayString);
      window.location.assign("/part-one-result");
      return cleanedText
    })
    .catch(function(error){
      console.log(error);
    })
  }
}

}
// hides unselected methods from methods reference sections
function hideUnpopulatedMethods(){
  let destination = document.getElementById("destination")
  if (destination!= null){
    let methods = document.getElementsByClassName("method");
    let image = document.getElementsByClassName("example");
    //hide all methods
    for(var i =0; i<methods.length; i++){
      methods[i].style.display = 'none';
      methods[i].style.visibility = 'hidden';
    }
    // unhide them base on if they're selected
    for(var i =0; i<methods.length; i++){
      if(localStorage.getItem(methods[i].id) != null){
        methods[i].style.display = 'inline-block'
        methods[i].style.visibility = 'visible'
      }
    }

  }
}

//parse HTML response to gather requiste method title, description, and image
function sanitizeFetch(string){
  let methodMetadata = [];

  let descRegex = /<p\s*class\s*=\s*"description"\s*>([^>]+?)<\/p>/g;
  let description = descRegex.exec(string);
  if(description != null){
    let descNoFrontTag = description[0].replace(/<p[^>]*>/,"");
    let descWithoutTags = descNoFrontTag.replace(/<\/p\s*>/,"");
    methodMetadata.push(stripWhitespace(descWithoutTags));
  }
  else{
      methodMetadata.push("Description unavailable.");
  }

  let titleRegex = /<h1\s*class\s*=\s*"site-page-title"\s*>([^>]+?)<\/h1>/g;
  let title = titleRegex.exec(string);
  if(title != null){
    let titleNoFrontTag = title[0].replace(/<h1[^>]*>/,"");
    let titleWithoutTags = titleNoFrontTag.replace(/<\/h1\s*>/,"");
    methodMetadata.push(stripWhitespace(titleWithoutTags));
  }
  else{
    methodMetadata.push("Design Method");
  }

  let imgSrcRegex = /<img\s*class\s*=\s*"example"\s*[^>]([^>]+?)>/g;
  let srcRegex = /src="([^">]+)/;
  let exampleTag = imgSrcRegex.exec(string);
  if(exampleTag != null){
    let exampleSrc = exampleTag[0].split(/src="([^">]+)/);
    if(exampleSrc[1].includes("alt")){
      methodMetadata.push("")
    }
    else{
      methodMetadata.push(stripWhitespace(exampleSrc[1]));
    }
  }
  else{
    methodMetadata.push("");
  }
  return methodMetadata;
}
//strip whitespace from string
function stripWhitespace(str) {
    return str.replace(/^\s+|\s+$/g, '');
}
//unhide selected containers after filtering
function showContainer(tags) {
//   // loop through all lists and hide them
  var lists = document.getElementById('method-results');
  if(lists !=null){

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

  }
//add requiste listeners to page and populate methods based on localStorage data
function preparePageOnLoad(){
  let filters = document.getElementsByClassName("filter-checkbox");
  if(filters != null){
    for(let i=0; i<filters.length ; i++){
      filters[i].addEventListener("click",filterTemplates,false);
    }
  }

  let generate = document.getElementById("generate")
  if(generate != null){
    generate.addEventListener("click",generateMaster,false)
  }

  let destination = document.getElementById("destination")
  if (destination!= null){
    populateMethodsCompendium();
  }
}
//populate methods compendium based on filtered methods
function populateMethodsCompendium(){
  let methods = document.getElementsByClassName("site-page-title");
  for(var i =0; i<methods.length;i++){
      let nameOfMethod = methods[i].id.slice(0,methods[i].id.length-6);
      let info = localStorage.getItem(nameOfMethod);
      if( info !=null){
        let infoArray = JSON.parse(info);
        let curMethod = infoArray[1];

        var title = document.getElementById(curMethod+"-title");
        var description = document.getElementById(curMethod+"-description");
        var image = document.getElementById(curMethod+"-image");

        description.innerHTML = infoArray[0];
        title.innerHTML = infoArray[1];
        if(infoArray[2].includes("alt")){
          image.src = "";
        }
        else{
          image.src = infoArray[2];
          }
      }
    }

  hideUnpopulatedMethods()
}
//load the checkboxes that should persist over pages
function checkFromLocalStore(){
  let filters = document.getElementsByClassName("filter-checkbox");
  let filterNames = document.getElementsByClassName("filter-checkbox-label");
  let checkedFilters = "" ;

  for(var i=0; i < filters.length; i++) {
    let isChecked = localStorage.getItem(filterNames[i].innerHTML);
    if(isChecked == "true"){
      checkedFilters = checkedFilters +' '+ filterNames[i].innerHTML;
      filters[i].checked = true;
    }
  }
  showContainer(checkedFilters);

}
//prep localstore variables if the user is accessing the page for the first time
function prepLocalStore(){
  alert("Prepping Local Store");
  let filters = document.getElementsByClassName("filter-checkbox");
  let filterNames = document.getElementsByClassName("filter-checkbox-label");
  for(var i = 0; i < filters.length; i++){
    localStorage.setItem(filterNames[i].innerHTML, "false");
  }
}
//handle checking of filter checkboxes whenever something is checked
function filterTemplates(){
    let filters = document.getElementsByClassName("filter-checkbox");
    let filterNames = document.getElementsByClassName("filter-checkbox-label");

    let checkedFilters = "" ;
    for(var i = 0; i < filters.length; i++){
        if(filters[i].checked == true){
          checkedFilters = checkedFilters +' '+ filterNames[i].innerHTML;
          localStorage.setItem(filterNames[i].innerHTML,"true");
        }
        else{
          localStorage.setItem(filterNames[i].innerHTML,"false");

        }

    }
    setActiveTag(checkedFilters);
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
  //bind navbar to the top of the page
  navbar = document.querySelector("#navbar");
  banner = document.getElementsByClassName("usa-banner")[0];
  sticky = navbar.offsetTop - banner.offsetHeight;
  //handle local storage page preparation 
  if (typeof(Storage) !== "undefined") {
    if(localStorage.getItem("setBefore") == null){
      localStorage.setItem("setBefore", "true");
      prepLocalStore();
    }
    else{
      //handle checking of filters based on previous entries
      checkFromLocalStore();
    }
  } else {
    // TODO Write code for things that can't handle localStorage
  }


}, false);
