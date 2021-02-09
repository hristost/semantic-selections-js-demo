/// The depest selection that has been made inside the current node, used for backtracking
deepestSelection = null
function main() {
  let tree = new Range(littleprince, 0, 0, 0, null)
  console.log(tree)

  document.getElementById("textField").value = tree.string;
  let textarea = document.getElementById('textField')

  textarea.addEventListener('keydown', function(e) {
    // Which keys we pass to the text field
    const passthrough = []
    if (!passthrough.includes(e.key)) {
      e.preventDefault();
    }

    if (e.key == 'ArrowUp') {
      let start = textarea.selectionStart;
      let end = textarea.selectionEnd;

      let node = tree.findNode(start, end, true)
      if (node && node.level > 0) {
        textarea.setSelectionRange(node.rangeStart, node.rangeEnd)
        if (deepestSelection == null) {
          deepestSelection = node
        }
      }

    }
    if (e.key == 'ArrowDown') {
      let start = textarea.selectionStart;
      let end = textarea.selectionEnd;
      console.log(deepestSelection, start, end)

      let cutout = tree.findNode(start, end, false)
      let node = cutout

      if (deepestSelection == null || cutout.string === deepestSelection.string) {
        console.log("Selection:", cutout.string);
        if (cutout.children.length > 0) {
          node = cutout.children[0]
          deepestSelection = node
        }

      } else {
        console.log("Selection:", cutout.string);
        node = deepestSelection
        while (node.parent && node.parent != cutout) {
          node = node.parent 
        }
      }
      textarea.setSelectionRange(node.rangeStart, node.rangeEnd)

    }
    if (e.key == 'ArrowLeft' || e.key == 'ArrowRight') {
      let start = textarea.selectionStart;
      let end = textarea.selectionEnd;
      direction = e.key == 'ArrowLeft' ? -1 : 1

      let node = tree.findNode(start, end, false)
      if (node) {
        let adjacent = node.adjacent(direction)
        if (adjacent) {
          textarea.setSelectionRange(adjacent.rangeStart, adjacent.rangeEnd)
          deepestSelection = adjacent
        }
      }

    }
  });


  function handleSelection() {
      let start = textarea.selectionStart;
      let end = textarea.selectionEnd;
      deepestSelection = tree.findNode(start, end, false)
      console.log("deepest: ", deepestSelection.string)
  }

  textarea.addEventListener('select', handleSelection)
}

