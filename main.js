/// The depest selection that has been made inside the current node, used for backtracking
var deepestSelection = null
var level = 100;
var textarea;
var tree;

/// How many units the user has scrolled. Reset whenever a threshold is exceeded
var scrollWheelDelta = 0;

/// Whether mouse mode is active. Enabled by pressing the middle mouse button
var mouseMode = false;

function main() {
  tree = new Range(littleprince, 0, 0, 0, null);

  textarea = document.getElementById('textField');
  textarea.innerHTML = tree.string;


  textarea.addEventListener('mousedown', function(e) {
    if (e.button == 1) {
      e.preventDefault();
      mouseMode = true;
      level = 100;
      textarea.focus();
      node = nodeAtMousePosition(e.clientX, e.clientY)
      if (node) textarea.setSelectionRange(node.rangeStart, node.rangeEnd)
    }
  })
  textarea.addEventListener('mouseup', function(e) {
    if (e.button == 1) {
    e.preventDefault();
      mouseMode = false;
    }
  })
  textarea.addEventListener('wheel', e => {
    if (mouseMode) e.preventDefault();
  });
  textarea.addEventListener('wheel', e => {
    if (!mouseMode) return;
    e.preventDefault();
    scrollWheelDelta += e.deltaY;
    if (Math.abs(scrollWheelDelta) >= 1) {
        scrollWheelDelta = 0;
        level -= Math.sign(e.deltaY);
        level = Math.max(1, level);
    }
    node = nodeAtMousePosition(e.clientX, e.clientY)
    if (node) textarea.setSelectionRange(node.rangeStart, node.rangeEnd)
  });
  textarea.addEventListener('mousemove', e => {
    if (!mouseMode) return;
    node = nodeAtMousePosition(e.offsetX, e.offsetY)
    if (node) textarea.setSelectionRange(node.rangeStart, node.rangeEnd)
  });
  textarea.addEventListener('select', handleSelection)
  textarea.addEventListener('keydown', function(e) {
    // Which keys should not use the default behaviour
    const blocked = ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
    if (blocked.includes(e.key)) {
      e.preventDefault();
    }
    console.log(e.key, e.key == "Tab");
    if (e.key == "Tab") mouseMode = true;

    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;

    let node = null
    if (e.key == 'ArrowUp')    node = expandSelection(start, end)
    if (e.key == 'ArrowDown')  node = shrinkSelection(start, end)
    if (e.key == 'ArrowLeft')  node = shiftSelection(start, end, -1)
    if (e.key == 'ArrowRight') node = shiftSelection(start, end, 1)

    if (node) textarea.setSelectionRange(node.rangeStart, node.rangeEnd)
  });
  textarea.addEventListener('keyup', function(e) {
    if (e.key == "Tab") mouseMode = false;
  });


}


/// Find the character offset of the mouse position in the given div
function getOffsetAtPoint(elem, x, y) {
    // https://stackoverflow.com/a/30586239
    var range, textNode, offset;
    if (document.body.createTextRange) {
      // Internet Explorer
       try {
         range = document.body.createTextRange();
         range.moveToPoint(event.clientX, event.clientY);
         range.select();
         range = getTextRangeBoundaryPosition(range, true);
      
         textNode = range.node;
         offset = range.offset;
       } catch(e) {
         
       }
    } else if (document.caretPositionFromPoint) {
      // Firefox, Safari
      // REF: https://developer.mozilla.org/en-US/docs/Web/API/Document/caretPositionFromPoint
      range = document.caretPositionFromPoint(event.clientX, event.clientY);
      textNode = range.offsetNode;
      offset = range.offset;
      // Chrome
      // REF: https://developer.mozilla.org/en-US/docs/Web/API/document/caretRangeFromPoint
    } else if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(event.clientX, event.clientY);
      textNode = range.startContainer;
      offset = range.startOffset;
    }
    return offset
} 
/// Called whenever the selection updates. Set the deepest selection if necessary
function handleSelection(e) {
  let start = textarea.selectionStart;
  let end = textarea.selectionEnd;
  let newSelection = tree.findNode(start, end, false)
  if (deepestSelection == null) deepestSelection = newSelection

  // If the deepest selection is a child of the new selection, don't update it
  let node = deepestSelection

  while (newSelection && (node != newSelection) && node.parent) node = node.parent
  if (node != newSelection) {
    deepestSelection = newSelection
  }

}

function expandSelection(start, end) {
  let node = tree.findNode(start, end, true)
  if (node && node.level > 0) {
    level = node.level;
    return node
  } else {
    return null
  }
}

function shrinkSelection(start, end) {
  let cutout = tree.findNode(start, end, false)
  let node = cutout

  if (deepestSelection == null || cutout.string === deepestSelection.string) {
    if (cutout.children.length > 0) {
      node = cutout.children[0]
    }

  } else {
    node = deepestSelection
    while (node.parent && node.parent != cutout) {
      node = node.parent 
    }
  }
  if (node) level = node.level;
  return node
}

function shiftSelection(start, end, direction) {
  let node = tree.findNode(start, end, false)
  if (node) node = node.adjacent(direction)

  while (node && node.level < level && node.children.length > 0) {
    if (direction == 1) node = node.children[0]
    else node = node.children[node.children.length-1]
  }

  return node
}

function nodeAtMousePosition(x, y) {
    offset = getOffsetAtPoint(textarea, x, y);
    offset = Math.min(offset, tree.string.length);

    if (tree.string[offset] == " ") return null;
	origLevel = level
    node = expandSelection(offset, offset)
    level = origLevel
	if (node) node = expandToLevel(node, level);
	level = Math.min(level, node.level);
	return node;
}

/// Find a parent consitutent of the node at the given level.
/// If the target level is deeper than the node, the node itself will be returned
function expandToLevel(node, level) {
    while (node.level > level && node.parent) node = node.parent;
    return node;
}
