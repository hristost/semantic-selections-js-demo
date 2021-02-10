/// The depest selection that has been made inside the current node, used for backtracking
deepestSelection = null
var level = 0;
var textarea;
var tree;

function main() {
  tree = new Range(littleprince, 0, 0, 0, null);

  textarea = document.getElementById('textField');
  textarea.value = tree.string;

  textarea.addEventListener('select', handleSelection)
  textarea.addEventListener('keydown', function(e) {
    // Which keys we pass to the text field
    const passthrough = []
    if (!passthrough.includes(e.key)) {
      e.preventDefault();
    }

    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;

    let node = null
    if (e.key == 'ArrowUp')    node = expandSelection(start, end)
    if (e.key == 'ArrowDown')  node = shrinkSelection(start, end)
    if (e.key == 'ArrowLeft')  node = shiftSelection(start, end, -1)
    if (e.key == 'ArrowRight') node = shiftSelection(start, end, 1)

    if (node) textarea.setSelectionRange(node.rangeStart, node.rangeEnd)
  });

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
