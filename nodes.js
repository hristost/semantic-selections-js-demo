/// A possible selection range
/// Within a range, there may be multiple subranges (children) for a more refined selection
class Range {
  constructor(node, offset, level, index, parent) {
    this.rangeStart = offset
    this.children = []
    this.parent = parent
    this.level = level
    this.index = index
    if (typeof node == "object") {
      // A branch node
      this.string = ""
      let start = this.rangeStart


      let idx = 0
      for (let child of node) {
        let range = new Range(child, start, level + 1, idx, this)
        this.rangeEnd = range.rangeEnd
        if (idx == 0) {
          this.rangeStart = range.rangeStart
        }

        this.string = this.string + range.string
        start = range.rangeEnd
        this.children = this.children.concat(range)
        
        idx += 1
      }

    } else if (typeof node == "string") {
      // A leaf node
      let word = node
      const punctuation = ".,?!:"
      if (!punctuation.includes(word) && !word.startsWith("n't")) {
        // Include a space unless we're appending a punctuation mark or a suffix.
        this.string = " " + word
        this.rangeStart += 1
      } else {
        this.string = word
      }
      this.rangeEnd = offset + this.string.length
    }

  }

  /// Find the shortest node that contains the range
  findNode(start, end, expand) {
    if (start < this.rangeStart || end > this.rangeEnd) {
      return null
    }
    if (expand && start == this.rangeStart && end == this.rangeEnd) {
      return null
    }
    if (this.children.length == 0) {
      return this
    }
    for (let child of this.children) {
      let node = child.findNode(start, end, expand)
      if (node) return node;
    }
    return this

  }
  /// Find the shortest node that contains the range
  adjacent(direction) {
    let parent = this.parent
    if (!parent) {
      return null
    }
    let adjacentIdx = this.index + direction
    console.log(this.index, adjacentIdx, parent.children.length)
    if (0 <= adjacentIdx && adjacentIdx < parent.children.length) {
      return parent.children[adjacentIdx]
    } else if(parent) {
      return parent.adjacent(direction)
    } else {
      return null
    }
  }
}
