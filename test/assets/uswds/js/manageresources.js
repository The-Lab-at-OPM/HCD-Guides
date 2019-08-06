//TODO dynamic hiding of filters

function getAirtableData(reason, selectedTags, section, id){

  if(selectedTags==undefined){
    selectedTags = ["all"];
  }
  if(section ==undefined){
    section = -1;
  }
  if(id == undefined){
    id = ["all"];
  }
////////////////////////////////////////////////////////////////////////
//   Insert API Key after the equals sign                             //
////////////////////////////////////////////////////////////////////////
  fetch("https://api.airtable.com/v0/appwodZA5P0LdCMm1/Methods?api_key=")
  .then((resp) => resp.json())
  .then(data =>{
    let selectedTagsParam = selectedTags;
    let sectionParam = section;
    let idParam = id;

    let methodsToReturn = filterAirtableData(data.records,selectedTagsParam,sectionParam,idParam);
    return methodsToReturn;
  })
  .then(methodsToReturn => {
    reason(methodsToReturn);
    return methodsToReturn;
  })
  .catch(err => {
    // Error
    console.log(err);
  });

}

function isSmallerArraySubset(smallArray, bigArray){
  for(var i=0; i<smallArray.length; i++){
    if(smallArray[i] != bigArray[i]){
      return false;
    }
  }
  return true;
}

function filterAirtableData(data,selectedTags,section,ids){

  //filter by id
  if(ids[0] != "all"){
    var result = data.filter(function(value){
      return ids.includes(value.id);
    })
    return result
  }

  //filter by tags
  // for some reason the Mouse onclick event is getting passed into the function.
  // The extra if check is a stopgap to prevent this from messing things up
  if(selectedTags[0] != "all" && selectedTags["type"] == undefined){
    //sort selected tags
    var sortedTags = tags.sort();

    //if selected tags is a subarray of the tags of the Entry, add the entry to the return
    var result = data.filter(function(entry){
      var sortedEntryTags = [];
      if(entry.fields["Tags"]){
        sortedEntryTags = entry.fields["Tags"].sort();
        return isSmallerArraySubset(sortedTags, sortedEntryTags);
      }
      else{
        return false;
      }
    })

    return result;
  }

  //filter by section. -1 Corresponds to "all sections"
  if(section != -1){

    var result = data.filter(function(entry){
      return entry.fields["Section"] == section;
    })

    return result;
  }

  return data;
}

/*
Updates the links in the sidebar nav according to which one is currently seleted
*/
function setActiveSidebar(){
  var sideNavs = document.getElementsByClassName("usa-sidenav__item")
  let selection = window.location.pathname;
  for(var i =0; i<sideNavs.length; i++){
    let links = sideNavs[i].getElementsByTagName("a");
    let subLists = sideNavs[i].getElementsByTagName("ul");
    for(var j = 0; j<links.length; j++){
      if(links[j].getAttribute("href") == selection){
        links[j].className = "usa-sidenav__item usa-current"
      }
      else{
        links[j].className = "usa-sidenav__item"
      }
    }
  }

}

function animateAccordion(acc){
  this.classList.toggle("active");
  var panel = this.nextElementSibling;
  if (panel.style.maxHeight){
    panel.style.maxHeight = undefined;
  } else {
    panel.style.maxHeight = panel.scrollHeight + "px";
  }
}

function populateResourcesWrapper(section){
  function populateResources(data){
    let methodContainer = document.getElementById("method-results");

    for(let i=0; i<data.length; i++){
      let method = document.createElement("a");
      method.href = "";
      let tags = data[i].fields["Tags"];
      let methodClassName = "method-result " + tags.join(" ");
      method.className = methodClassName;
      method.id = data[i].id;

      let button = document.createElement("button");
      button.className = "usa-button card";

      let title = document.createElement("h5");
      title.innerHTML = data[i].fields["Name"];
      title.className = "title"

      button.appendChild(title);
      method.appendChild(button);
      methodContainer.appendChild(method);

    }

    checkFromLocalStore();
    filterTemplates();
  }
  getAirtableData(populateResources, undefined,section,undefined);

}

//populate methods compendium based on filtered methods
function populateMethodsCompendium(data){
  let toPrint = document.getElementsByClassName('methods-compendium')[0];
  toPrint.innerHTML = "";
  for(let i=0; i<data.length; i++){
    let methodTitleContent = data[i].fields["Name"];
    let methodDescriptionContent = data[i].fields["Notes"];
    let methodImageContent = data[i].fields["Attachments"][0]["url"];

    let methodContainer = document.createElement("div");
    methodContainer.className = "method-container";

    let methodTitle = document.createElement("h3");
    methodTitle.className = "method-title";
    methodTitle.innerHTML = methodTitleContent;

    let methodDescription = document.createElement("p");
    methodDescription.className = "method-description";
    methodDescription.innerHTML = methodDescriptionContent;

    let methodImage = document.createElement("img");
    methodImage.className = "method-image";
    methodImage.src = methodImageContent;

    methodContainer.appendChild(methodTitle);
    methodContainer.appendChild(methodDescription);
    methodContainer.appendChild(methodImage);

    toPrint.appendChild(methodContainer);
  }

  printElem(toPrint);


}

function printElem(elem){
    var mywindow = window.open();

    mywindow.document.write('<html><head><title>' + document.title  + '</title>');
    mywindow.document.write('</head><body >');
    mywindow.document.write('<h1>' + document.title  + '</h1>');
    mywindow.document.write(elem.innerHTML);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/

    mywindow.print();
    mywindow.close();

    elem.style.display = "none";
    return true;
}

/*
Takes filtered methods and populates them into section methods reference books
*/
function generateMaster(){
  var lists = document.getElementById('method-results');
  //removes all methods from localStorage
  if(lists !=undefined){
    var results = lists.getElementsByTagName("div");
    var allMethods = []
    for(var i=0; i<results.length; i++){
      let nameOfMethod = results[i].id;
      localStorage.removeItem(nameOfMethod)
    }
    //gathers methods that are selected by filtering
    var filteredMethods = [];
    var links = lists.getElementsByClassName("method-result");
    for(var i=0; i<links.length; i++){
      const style = getComputedStyle(links[i])
      if(style.display == 'inline-block' ||   links[i].style.display == 'inline-block'){
        filteredMethods.push(links[i].id);
      }
    }
    getAirtableData(populateMethodsCompendium, undefined, undefined, filteredMethods);
  }
}


// hides unselected methods from methods reference sections
function hideUnpopulatedMethods(){
  let destination = document.getElementById("destination")
  if (destination!= undefined){
    let methods = document.getElementsByClassName("method");
    let image = document.getElementsByClassName("example");
    //hide all methods
    for(var i =0; i<methods.length; i++){
      methods[i].style.display = 'none';
      methods[i].style.visibility = 'hidden';
    }
    // unhide them base on if they're selected
    for(var i =0; i<methods.length; i++){
      if(localStorage.getItem(methods[i].id) != undefined){
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
  if(description != undefined){
    let descNoFrontTag = description[0].replace(/<p[^>]*>/,"");
    let descWithoutTags = descNoFrontTag.replace(/<\/p\s*>/,"");
    methodMetadata.push(stripWhitespace(descWithoutTags));
  }
  else{
    methodMetadata.push("Description unavailable.");
  }

  let titleRegex = /<h1\s*class\s*=\s*"site-page-title"\s*>([^>]+?)<\/h1>/g;
  let title = titleRegex.exec(string);
  if(title != undefined){
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
  if(exampleTag != undefined){
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
  if(lists !=undefined){

    var results = document.getElementsByClassName('method-result');
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
  showContainer(checkedFilters);
}

//add requiste listeners to page and populate methods based on localStorage data
function preparePageOnLoad(){
  let airtableButton = document.getElementsByClassName("airtable-retrive")[0];
  if(airtableButton != undefined){
    airtableButton.addEventListener("click", getAirtableData,false);
  }

  let sectionSelector = document.getElementsByClassName("section-selector")[0];
  if(sectionSelector != undefined){
    let sectionNumber = sectionSelector.id;
    populateResourcesWrapper(sectionNumber);

  }

  let sideNav = document.getElementsByClassName("usa-sidenav__item");
  if(sideNav != undefined){
    setActiveSidebar()
  }
  let filters = document.getElementsByClassName("filter-checkbox");
  if(filters != undefined){
    for(let i=0; i<filters.length ; i++){
      filters[i].addEventListener("click",filterTemplates,false);
    }
  }

  let generate = document.getElementsByClassName("generate")
  if(generate.length !=0 && generate != undefined){
    generate[0].addEventListener("click",generateMaster,false)
  }


}
document.addEventListener("DOMContentLoaded",function(){
  preparePageOnLoad();
  //handle local storage page preparation

  if (typeof(Storage) !== "undefined") {
    if(localStorage.getItem("setBefore") == undefined){
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
