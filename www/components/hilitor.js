// Original JavaScript code by Chirp Internet: www.chirp.com.au
// Please acknowledge use of this code by including this header.
// http://www.the-art-of-web.com/javascript/search-highlight/
// Edited for iteration though matched items by Brian Feldman (brian.feldman@uspto.gov).

function Hilitor(id, tag)
{

  var targetNode = document.getElementById(id) || document.body;
  var hiliteTag = tag || "EM";
  var skipTags = new RegExp("^(?:" + hiliteTag + "|SCRIPT|FORM|SPAN)$");
  var colors = ["#ff6", "#a0ffff", "#9f9", "#f99", "#f6f"];
  var wordColor = [];
  var colorIdx = 0;
  var matchRegex = "";
  var openLeft = false;
  var openRight = false;
  this.matchCount = 0;
  this.currentMatch = 0;
  var currentInput = "";

  this.setMatchType = function(type)
  {
    switch(type)
    {
      case "left":
        this.openLeft = false;
        this.openRight = true;
        break;
      case "right":
        this.openLeft = true;
        this.openRight = false;
        break;
      case "open":
        this.openLeft = this.openRight = true;
        break;
      default:
        this.openLeft = this.openRight = false;
    }
  };

  this.setRegex = function(input)
  {
    input = input.replace(/^[^\w]+|[^\w]+$/g, "").replace(/[^\w'-]+/g, "|");
    var re = "(" + input + ")";
    if(!this.openLeft){ re = "\\b" + re; }
    if(!this.openRight){ re = re + "\\b"; }
    matchRegex = new RegExp(re, "i");
  };

  this.getRegex = function()
  {
    var retval = matchRegex.toString();
    retval = retval.replace(/(^\/(\\b)?|\(|\)|(\\b)?\/i$)/g, "");
    retval = retval.replace(/\|/g, " ");
    return retval;
  };

  // recursively apply word highlighting
  this.hiliteWords = function(node)
  {
    if(node === undefined || !node){ return; }
    if(!matchRegex){ return; }
    if(skipTags.test(node.nodeName)){ return; }

    if(node.hasChildNodes()) {
      for(var i=0; i < node.childNodes.length; i++){
        this.hiliteWords(node.childNodes[i]);
      }
    }
    if(node.nodeType == 3) { // NODE_TEXT
      if((nv = node.nodeValue) && (regs = matchRegex.exec(nv))) {
        if(!wordColor[regs[0].toLowerCase()]) {
          wordColor[regs[0].toLowerCase()] = colors[colorIdx++ % colors.length];
        }

        this.matchCount = this.matchCount + 1;
        var match = document.createElement(hiliteTag);
        match.appendChild(document.createTextNode(regs[0]));
        match.style.backgroundColor = wordColor[regs[0].toLowerCase()];
        match.style.fontStyle = "inherit";
        match.style.color = "#000";
        match.id = "match" + this.matchCount;

        var after = node.splitText(regs.index);
        after.nodeValue = after.nodeValue.substring(regs[0].length);
        node.parentNode.insertBefore(match, after);
      }
    }
  };

  // remove highlighting
  this.remove = function()
  {
    currentInput = "";
    this.currentMatch = 0;
    this.matchCount = 0;
    var arr = document.getElementsByTagName(hiliteTag);
    while(arr.length && (el = arr[0])) {
      var parent = el.parentNode;
      parent.replaceChild(el.firstChild, el);
      parent.normalize();
    }
  };

  // start highlighting at target node
  this.apply = function(input)
  {
    if(input === undefined || !input || input == currentInput){
      return;
    }

    this.currentMatch = 0;
    this.matchCount = 0;
    this.remove();
    currentInput = input;
    this.setRegex(input);
    this.hiliteWords(targetNode);
  };

  this.next = function(){
    this.currentMatch = this.currentMatch + 1;
    if (this.currentMatch > this.matchCount){
        this.currentMatch = 1;
    }
    return "match" + this.currentMatch;
  };

}
