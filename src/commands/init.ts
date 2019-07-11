
exports.command = "init [dir]"
exports.desc = "Create a new Kiwi project"

exports.builder = {
  dir: {
    default: "."
  }
}

exports.handler = (argv: any) => {
  console.log("init called for dir", argv.dir)
}
