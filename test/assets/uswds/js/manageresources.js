//TODO dynamic hiding of filters


//TODO: Change to support multiple filters at once
function setActiveTag(tag) {
  // loop through all items and remove active class
  var items = document.getElementsByClassName('blog-tag-item');
  for(var i=0; i < items.length; i++) {
    items[i].setAttribute('class', 'blog-tag-item');
  }

  // set the selected tag's item to active
  var item = document.getElementById(tag + '-item');
  if(item) {
    item.setAttribute('class', 'blog-tag-item active');
  }
}


function showContainer(tags) {
  // loop through all lists and hide them
  var lists = document.getElementById('method-results');
  var results = lists.getElementsByTagName("div");
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

  }

  function filterTemplates(){
    let filters = document.getElementsByClassName("filter-checkbox");
    let filterNames = document.getElementsByClassName("filter-checkbox-label");

    let checkedFilters = "" ;
    for(var i = 0; i < filters.length; i++){
        if(filters[i].checked == true){
          checkedFilters = checkedFilters +' '+ filterNames[i].innerHTML;
        };

    }
    setActiveTag(checkedFilters);
    showContainer(checkedFilters);
  }


document.addEventListener("DOMContentLoaded",function(){
  bindListeners();
}, false);
