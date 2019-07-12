import newCommand from "../core/newCommand"
import blessed from "blessed"

newCommand(this, {
  command: "ps",
  description: "Current project(s) statuses",
  handler: (args, path) => {
    var screen = blessed.screen({
      smartCSR: true,
      title: "Test",
    })

    const test = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in arcu nunc. Aliquam elementum mattis diam, sed porta justo fermentum vitae. Proin blandit feugiat mi, eu sagittis nunc lobortis eget. Fusce at ipsum vulputate mauris mattis ultrices. Curabitur pretium, risus at auctor pellentesque, justo ipsum rutrum libero, et tincidunt purus arcu et magna. Fusce a nunc urna. In rutrum est ut ultricies rhoncus. Cras eget metus pretium, rutrum libero non, malesuada justo. Nulla sodales mauris nec posuere tincidunt. Vestibulum vel tempus tellus, id ultrices neque. Curabitur non blandit orci.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in arcu nunc. Aliquam elementum mattis diam, sed porta justo fermentum vitae. Proin blandit feugiat mi, eu sagittis nunc lobortis eget. Fusce at ipsum vulputate mauris mattis ultrices. Curabitur pretium, risus at auctor pellentesque, justo ipsum rutrum libero, et tincidunt purus arcu et magna. Fusce a nunc urna. In rutrum est ut ultricies rhoncus. Cras eget metus pretium, rutrum libero non, malesuada justo. Nulla sodales mauris nec posuere tincidunt. Vestibulum vel tempus tellus, id ultrices neque. Curabitur non blandit orci.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in arcu nunc. Aliquam elementum mattis diam, sed porta justo fermentum vitae. Proin blandit feugiat mi, eu sagittis nunc lobortis eget. Fusce at ipsum vulputate mauris mattis ultrices. Curabitur pretium, risus at auctor pellentesque, justo ipsum rutrum libero, et tincidunt purus arcu et magna. Fusce a nunc urna. In rutrum est ut ultricies rhoncus. Cras eget metus pretium, rutrum libero non, malesuada justo. Nulla sodales mauris nec posuere tincidunt. Vestibulum vel tempus tellus, id ultrices neque. Curabitur non blandit orci.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in arcu nunc. Aliquam elementum mattis diam, sed porta justo fermentum vitae. Proin blandit feugiat mi, eu sagittis nunc lobortis eget. Fusce at ipsum vulputate mauris mattis ultrices. Curabitur pretium, risus at auctor pellentesque, justo ipsum rutrum libero, et tincidunt purus arcu et magna. Fusce a nunc urna. In rutrum est ut ultricies rhoncus. Cras eget metus pretium, rutrum libero non, malesuada justo. Nulla sodales mauris nec posuere tincidunt. Vestibulum vel tempus tellus, id ultrices neque. Curabitur non blandit orci.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in arcu nunc. Aliquam elementum mattis diam, sed porta justo fermentum vitae. Proin blandit feugiat mi, eu sagittis nunc lobortis eget. Fusce at ipsum vulputate mauris mattis ultrices. Curabitur pretium, risus at auctor pellentesque, justo ipsum rutrum libero, et tincidunt purus arcu et magna. Fusce a nunc urna. In rutrum est ut ultricies rhoncus. Cras eget metus pretium, rutrum libero non, malesuada justo. Nulla sodales mauris nec posuere tincidunt. Vestibulum vel tempus tellus, id ultrices neque. Curabitur non blandit orci.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in arcu nunc. Aliquam elementum mattis diam, sed porta justo fermentum vitae. Proin blandit feugiat mi, eu sagittis nunc lobortis eget. Fusce at ipsum vulputate mauris mattis ultrices. Curabitur pretium, risus at auctor pellentesque, justo ipsum rutrum libero, et tincidunt purus arcu et magna. Fusce a nunc urna. In rutrum est ut ultricies rhoncus. Cras eget metus pretium, rutrum libero non, malesuada justo. Nulla sodales mauris nec posuere tincidunt. Vestibulum vel tempus tellus, id ultrices neque. Curabitur non blandit orci.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in arcu nunc. Aliquam elementum mattis diam, sed porta justo fermentum vitae. Proin blandit feugiat mi, eu sagittis nunc lobortis eget. Fusce at ipsum vulputate mauris mattis ultrices. Curabitur pretium, risus at auctor pellentesque, justo ipsum rutrum libero, et tincidunt purus arcu et magna. Fusce a nunc urna. In rutrum est ut ultricies rhoncus. Cras eget metus pretium, rutrum libero non, malesuada justo. Nulla sodales mauris nec posuere tincidunt. Vestibulum vel tempus tellus, id ultrices neque. Curabitur non blandit orci."

    screen.append(blessed.box({ top: "0", left: "0", width: "50%", height: "50%",
      content: test, tags: true, border: { type: "line" }, scrollable: true,
      mouse: true,
    }))

    screen.append(blessed.box({ top: "0", right: "0", width: "50%", height: "50%",
      content: test, tags: true, border: { type: "line" }, scrollable: true, mouse: true,
    }))

    screen.append(blessed.box({ bottom: "0", left: "0", width: "50%", height: "50%",
      content: test, tags: true, border: { type: "line" }, scrollable: true, mouse: true,
    }))

    screen.append(blessed.box({ bottom: "0", right: "0", width: "50%", height: "50%",
      content: test, tags: true, border: { type: "line" }, scrollable: true, mouse: true,
    }))

    screen.key([ "escape", "q", "C-c" ], function(ch, key) {
      return process.exit(0);
    })

    screen.render()
  },
})
